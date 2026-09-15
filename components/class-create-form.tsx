"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function ClassCreateForm({ onCreated }: { onCreated?: (id: string) => void }) {
  const router = useRouter(); const [pending, setPending] = useState(false); const [message, setMessage] = useState("");
  return <form className="class-create-form" onSubmit={async e => {
    e.preventDefault(); const form=e.currentTarget; const data=new FormData(form); setPending(true); setMessage("");
    try { const r=await fetch("/api/teacher/classes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(data))});const result=await r.json();if(!r.ok)throw new Error(result.error);onCreated?.(result.id);setMessage("班级已创建，请上传学生名单。");form.reset();router.refresh(); }
    catch(error){setMessage(error instanceof Error?error.message:"创建失败");}finally{setPending(false);}
  }}><h3>新建班级</h3><label>班级名称<input name="name" placeholder="例如：智慧农业 2026 级 2 班" minLength={2} maxLength={60} required /></label><label>学年<input name="academicYear" defaultValue="2026-2027" required /></label><label>学期<input name="semester" defaultValue="第一学期" required /></label><button className="primary-button" disabled={pending}>{pending?"正在创建…":"创建班级"}</button>{message&&<p role="status">{message}</p>}</form>;
}
