"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, KeyRound, RotateCcw, Trash2, UserPlus, UsersRound } from "lucide-react";

import Link from "next/link";
import { ClassCreateForm } from "@/components/class-create-form";
import { StudentCredentials, type StudentCredential } from "@/components/student-credentials";

type Member = { id: string; userId: string; status: "ACTIVE" | "ARCHIVED"; user: { id: string; username: string; displayName: string; nickname: string | null; studentNo: string | null; status: string } };
type ClassItem = { id: string; classId: string; classRoom: { id: string; name: string; academicYear: string; semester: string; isArchived: boolean; leaderboardAnonymous: boolean; enrollments: Member[] } };

async function send(url: string, method: string, body?: object) {
  const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "操作失败"); return data;
}

export function ClassManager({ classes }: { classes: ClassItem[] }) {
  const [deleting, setDeleting] = useState(false);
  const [credentials, setCredentials] = useState<StudentCredential[]>([]);
  const router = useRouter(); const [selected, setSelected] = useState(classes[0]?.classId ?? ""); const [message, setMessage] = useState(""); const selectedClassId = classes.some((item) => item.classId === selected) ? selected : classes.find((item) => !item.classRoom.isArchived)?.classId ?? classes[0]?.classId ?? ""; const current = classes.find((item) => item.classId === selectedClassId)?.classRoom;
  async function run(action: () => Promise<unknown>, onSuccess?: (result: unknown) => void) { try { setMessage("处理中…"); const result = await action(); if (result && typeof result === "object" && "credentials" in result) setCredentials(result.credentials as StudentCredential[]); onSuccess?.(result); setMessage("操作已保存"); router.refresh(); } catch (error) { setMessage(error instanceof Error ? error.message : "操作失败"); } }
  async function deleteClass() {
    if (!current || deleting) return;
    const name = window.prompt(`删除“${current.name}”将永久删除该班级、成员关系、课堂及作答记录、班级学习指标和导入记录，所有任课教师均无法再访问该班级。学生账号及个人汇总进度保留。此操作不可撤销；如需保留班级数据，请使用归档。\n请输入完整班级名称确认：`);
    if (name === null) return;
    if (name !== current.name) { setMessage("班级名称不匹配，未删除"); return; }
    setDeleting(true);
    try {
      await send(`/api/teacher/classes/${current.id}`, "DELETE", { name });
      setCredentials([]);
      setSelected(classes.find(item => item.classId !== current.id)?.classId ?? "");
      setMessage(`班级“${current.name}”已删除`);
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "删除班级失败"); }
    finally { setDeleting(false); }
  }
  return <div className="class-manager"><section className="class-list-panel"><header><h2>我的班级</h2><span>{classes.length} 个</span></header>{classes.map((item) => <button className={selectedClassId === item.classId ? "active" : ""} key={item.classId} onClick={() => setSelected(item.classId)}><b>{item.classRoom.name}</b><small>{item.classRoom.academicYear} · {item.classRoom.semester}</small><span>{item.classRoom.enrollments.filter((member) => member.status === "ACTIVE").length} 人{item.classRoom.isArchived ? " · 已归档" : ""}</span></button>)}<ClassCreateForm onCreated={setSelected} /></section>{current ? <section className="member-manager"><header><div><h2>{current.name}</h2><p>{current.academicYear} · {current.semester}</p></div><div><button onClick={() => void run(() => send(`/api/teacher/classes/${current.id}`, "PATCH", { leaderboardAnonymous: !current.leaderboardAnonymous }))}>{current.leaderboardAnonymous ? "排行榜匿名：开" : "排行榜匿名：关"}</button><button className="danger-quiet" onClick={() => void run(() => send(`/api/teacher/classes/${current.id}`, "PATCH", { isArchived: true }))}><Archive />归档班级</button><button className="danger-quiet" disabled={deleting} onClick={() => void deleteClass()}><Trash2 />{deleting ? "删除中…" : "删除班级"}</button></div></header><Link className="primary-button" href={`/teacher/imports?classId=${current.id}`}>上传学生名单（Excel）</Link><StudentCredentials items={credentials} /><details className="add-member"><summary><UserPlus />添加学生</summary><form onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); void run(() => send(`/api/teacher/classes/${current.id}/members`, "POST", Object.fromEntries(form))); }}><input name="displayName" placeholder="学生姓名" required /><input name="studentNo" placeholder="学号（即登录账号）" required /><input name="nickname" placeholder="匿名昵称（可选）" /><button className="primary-button">添加成员</button></form></details><div className="admin-table member-table"><div className="admin-table-head"><span>姓名</span><span>学号</span><span>账号</span><span>昵称</span><span>状态</span><span>操作</span></div>{current.enrollments.map((member) => <div key={member.id}><span><i className="student-avatar">{member.user.displayName.slice(-1)}</i><b>{member.user.displayName}</b></span><span>{member.user.studentNo}</span><span>{member.user.username}</span><span>{member.user.nickname ?? "未设置"}</span><b className={member.status === "ACTIVE" ? "status-active" : "status-archived"}>{member.status === "ACTIVE" ? "在班" : "已移出"}</b><span className="row-actions"><button title="重置密码" onClick={() => void run(() => send(`/api/teacher/classes/${current.id}/members/${member.userId}`, "PATCH", { action: "reset-password" }))}><KeyRound /></button>{member.status === "ACTIVE" ? <button title="移出班级" onClick={() => { if (window.confirm(`确认将${member.user.displayName}移出班级？学习记录会保留。`)) void run(() => send(`/api/teacher/classes/${current.id}/members/${member.userId}`, "DELETE")); }}><Trash2 /></button> : <button title="恢复成员" onClick={() => void run(() => send(`/api/teacher/classes/${current.id}/members/${member.userId}`, "PATCH", { action: "restore" }))}><RotateCcw /></button>}</span></div>)}</div></section> : <section className="member-manager admin-empty"><UsersRound /><b>尚未建立班级</b><p>请先在左侧创建班级，再添加学生。</p></section>}{message && <p className="manager-message" role="status">{message}</p>}</div>;
}
