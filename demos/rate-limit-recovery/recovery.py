#!/usr/bin/env python3
"""N112 pure offline HTTP recovery simulator. No network, tokens or real sleep."""
from __future__ import annotations
import argparse,json,sys
RETRY={429,502,503,504}
TERMINAL={400,401,403,404,422}
SCENARIOS={
 "recover-429":{"name":"Burst of 429","statuses":[429,429,200],"retry_after_ms":0},
 "respect-retry-after":{"name":"Server Retry-After","statuses":[503,503,200],"retry_after_ms":4000},
 "invalid-credentials":{"name":"Invalid credentials","statuses":[401,200],"retry_after_ms":0},
 "persistent-429":{"name":"Persistent rate limit","statuses":[429,429,429,429,429,429,429,200],"retry_after_ms":0},
 "transient-5xx":{"name":"Transient server outage","statuses":[502,503,200],"retry_after_ms":0},
 "success":{"name":"Immediate success","statuses":[200],"retry_after_ms":0},
}
def policy(max_attempts=5,base_delay_ms=500,max_delay_ms=30000,budget=5,seed=7):
    for name,value,lo,hi in (
        ("max_attempts",max_attempts,1,10),("base_delay_ms",base_delay_ms,100,5000),
        ("max_delay_ms",max_delay_ms,100,60000),("budget",budget,1,10),("seed",seed,0,9999)):
        if type(value) is not int or not lo<=value<=hi:raise ValueError(name+" outside allowed range")
    return {"max_attempts":max_attempts,"base_delay_ms":base_delay_ms,
            "max_delay_ms":max_delay_ms,"budget":budget,"seed":seed}
def simulate(statuses,retry_after_ms=0,config=None):
    cfg=policy(**(config or {}))
    if not isinstance(statuses,list) or not statuses or len(statuses)>20 or any(type(s) is not int or not 100<=s<=599 for s in statuses):
        raise ValueError("Invalid synthetic HTTP status sequence")
    if type(retry_after_ms) is not int or not 0<=retry_after_ms<=120000:raise ValueError("Invalid Retry-After")
    events=[];clock=0;reason="sequence_exhausted";success=False
    for attempt in range(1,min(cfg["max_attempts"],cfg["budget"],len(statuses))+1):
        http=statuses[attempt-1]
        item={"attempt":attempt,"at_ms":clock,"http":http,"retry":False,"delay_ms":0,"reason":""}
        if 200<=http<=299:
            reason="success";success=True;item["reason"]=reason;events.append(item);break
        if http in TERMINAL or http not in RETRY:
            reason="terminal_http";item["reason"]=reason;events.append(item);break
        if attempt>=cfg["max_attempts"]:
            reason="attempt_limit";item["reason"]=reason;events.append(item);break
        if attempt>=cfg["budget"]:
            reason="request_budget";item["reason"]=reason;events.append(item);break
        if attempt>=len(statuses):
            reason="sequence_exhausted";item["reason"]=reason;events.append(item);break
        # Reproducible jitter in the range [0.75, 0.99975] for teaching.
        frac=((cfg["seed"]*1103515245+attempt*12345)%1000)/1000
        exp=min(cfg["max_delay_ms"],cfg["base_delay_ms"]*(2**(attempt-1)))
        delay=max(int(exp*(.75+.25*frac)),retry_after_ms)
        if delay>cfg["max_delay_ms"]:
            reason="retry_after_exceeds_cap";item["reason"]=reason;events.append(item);break
        item["retry"]=True;item["delay_ms"]=delay;item["reason"]="retry_after" if retry_after_ms>int(exp*(.75+.25*frac)) else "exponential_backoff"
        events.append(item)
        clock+=delay
    return {"schema":"rate-limit-recovery-v1","scenario":"synthetic","config":cfg,"success":success,
            "stop_reason":reason,"requests":len(events),"elapsed_ms":clock,"events":events}
def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--scenario",choices=SCENARIOS,default="recover-429")
    ap.add_argument("--attempts",type=int,default=5)
    ap.add_argument("--base-ms",type=int,default=500)
    ap.add_argument("--max-ms",type=int,default=30000)
    ap.add_argument("--budget",type=int,default=5)
    ap.add_argument("--seed",type=int,default=7)
    args=ap.parse_args()
    try:
        cfg=policy(args.attempts,args.base_ms,args.max_ms,args.budget,args.seed)
        spec=SCENARIOS[args.scenario]
        output=simulate(spec["statuses"],spec["retry_after_ms"],cfg)
        output["scenario"]=args.scenario
        print(json.dumps(output,indent=2,ensure_ascii=False))
        return 0
    except ValueError as exc:
        print(json.dumps({"error":str(exc)}),file=sys.stderr);return 2
if __name__=="__main__":raise SystemExit(main())
