/* N006 — Human review checklist; conservative local decision simulator. */
(function(root,factory){const x=factory();if(typeof module==="object"&&module.exports)module.exports=x;if(root)root.HumanGate=x})(typeof window!=="undefined"?window:null,function(){
"use strict";
const ACTIONS=[
{id:"read",vi:"Đọc dữ liệu thử nghiệm",en:"Read a sample file",risk:0},
{id:"edit",vi:"Sửa file trong sandbox",en:"Edit sandbox code",risk:1},
{id:"send",vi:"Gửi email/dữ liệu",en:"Send email or data",risk:3},
{id:"delete",vi:"Xóa file hoặc record",en:"Delete a file or record",risk:3},
{id:"deploy",vi:"Deploy website",en:"Deploy website",risk:3},
{id:"purchase",vi:"Thanh toán/đặt mua",en:"Purchase or payment",risk:3}
];
const CHECKS=[
{id:"scope",vi:"Phạm vi thư mục, dữ liệu và quyền đã được giới hạn",en:"Files, data and access are scoped"},
{id:"tests",vi:"Đã thử trên dữ liệu giả và ghi kết quả",en:"Tested on synthetic data and recorded results"},
{id:"privacy",vi:"Không có mật khẩu, token hoặc dữ liệu cá nhân",en:"No passwords, tokens or private data"},
{id:"rollback",vi:"Có backup và phương án hoàn tác",en:"Backup and rollback are available"},
{id:"owner",vi:"Người có quyền phê duyệt đã được xác định",en:"An authorized approver is identified"}
];
function sensitive(s){return /(?:sk-[a-z0-9_-]{12,}|ghp_[a-z0-9_]{12,}|-----BEGIN [^-]+PRIVATE KEY-----|[\w.+-]+@(?:gmail|outlook|yahoo|hotmail)\.com)/i.test(s)}
function evaluate(input){
 const action=ACTIONS.find(a=>a.id===input?.action)||ACTIONS[0];
 const note=String(input?.note??"").slice(0,2000);
 const checks=Object.fromEntries(CHECKS.map(c=>[c.id,input?.checks?.[c.id]===true]));
 const flags={secret:sensitive(note),production:input?.production===true,external:input?.external===true};
 const missing=CHECKS.filter(c=>!checks[c.id]).map(c=>c.id);
 const highRisk=action.risk>=3||flags.secret||flags.production||flags.external;
 const blockers=[];
 if(flags.secret)blockers.push("CREDENTIAL_PRESENT");
 if(highRisk&&!checks.owner)blockers.push("MISSING_APPROVER");
 if(highRisk&&!checks.privacy)blockers.push("PRIVACY_UNVERIFIED");
 if(action.id==="deploy"&&!checks.rollback)blockers.push("MISSING_ROLLBACK");
 if(action.id==="delete"&&!checks.scope)blockers.push("DELETION_SCOPE_UNCLEAR");
 if(action.id==="send"&&!checks.scope)blockers.push("DATA_RECIPIENT_UNVERIFIED");
 let status;
 if(blockers.length)status="BLOCKED";
 else if(highRisk)status="NEEDS_HUMAN_APPROVAL";
 else if(missing.length)status="REVIEW_INCOMPLETE";
 else status="READY_FOR_REVIEW";
 return {status,action:action.id,highRisk,flags,blockers,missing,checks,
   disclaimer:"Simulation only. No automatic permission approval, email, deletion, payment or deployment."};
}
function receipt(decision,choice){
 if(!decision||decision.status==="BLOCKED"||decision.status==="REVIEW_INCOMPLETE")return null;
 if(!["approve","reject"].includes(choice))return null;
 return {schema:"N006-review-receipt-v1",action:decision.action,highRisk:decision.highRisk,
   reviewed:decision.checks,humanDecision:choice,simulated:true,
   sideEffectsExecuted:false,secretValuesIncluded:false,
   disclaimer:"Human decision recorded for this practice only; not authorization for an external tool."};
}
return {ACTIONS,CHECKS,sensitive,evaluate,receipt};
});