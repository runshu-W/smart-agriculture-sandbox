"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, CircleCheck, CircleOff, Save } from "lucide-react";

type Question = { id: string; key: string; prompt: string; options: unknown; correctAnswers: unknown; feedback: unknown; version: number; isPublished: boolean };
type Interaction = { id: string; title: string; description: string; order: number; isPublished: boolean; type: string; questions: Question[] };
type Task = { id: string; title: string; description: string; order: number; isPublished: boolean; interactions: Interaction[] };
type Unit = { id: string; title: string; description: string; order: number; isPublished: boolean; tasks: Task[] };

async function patch(url: string, body: object) {
  const response = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "保存失败");
  return result;
}

export function ContentManager({ units }: { units: Unit[] }) {
  const router = useRouter();
  const [unitId, setUnitId] = useState(units[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const unit = units.find((item) => item.id === unitId);
  async function run(action: () => Promise<unknown>) {
    try { setMessage("正在保存…"); await action(); setMessage("已保存并写入审计记录"); router.refresh(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "保存失败"); }
  }
  return <div className="content-manager">
    <aside className="content-unit-tabs">{units.map((item) => <button className={item.id === unitId ? "active" : ""} key={item.id} onClick={() => setUnitId(item.id)}><span>单元 {item.order}</span><b>{item.title}</b><small>{item.isPublished ? "学生可见" : "尚未开放"}</small></button>)}</aside>
    {unit && <section className="content-editor">
      <header><div><span>单元内容配置</span><h2>{unit.title}</h2><p>可编辑展示字段、顺序和发布状态；复杂场景的交互类型与必要步骤由代码保护。</p></div><button className={unit.isPublished ? "publish-toggle on" : "publish-toggle"} onClick={() => run(() => patch(`/api/teacher/content/unit/${unit.id}`, { isPublished: !unit.isPublished }))}>{unit.isPublished ? <CircleCheck /> : <CircleOff />}{unit.isPublished ? "已开放" : "未开放"}</button></header>
      {unit.tasks.map((task) => <details className="content-task" key={task.id} open><summary><ChevronDown /><span>任务 {task.order}</span><b>{task.title}</b><i>{task.interactions.length} 个互动</i><em>{task.isPublished ? "可见" : "隐藏"}</em></summary><div className="content-task-body"><EditableRow entity="task" item={task} onSave={run} />{task.interactions.map((interaction) => <details className="content-interaction" key={interaction.id}><summary><span>{interaction.order}</span><b>{interaction.title}</b><small>{interaction.type}</small><em>{interaction.isPublished ? "已发布" : "已隐藏"}</em></summary><EditableRow entity="interaction" item={interaction} onSave={run} />{interaction.questions.length ? <div className="question-list"><h4>题目与反馈</h4>{interaction.questions.map((question) => <QuestionEditor key={question.id} question={question} onSave={run} />)}</div> : <p className="empty-inline">该互动没有可编辑问答，动画与操作流程仍由代码实现。</p>}</details>)}</div></details>)}
      {message && <p className="manager-message" role="status">{message}</p>}
    </section>}
  </div>;
}

function EditableRow({ entity, item, onSave }: { entity: "task" | "interaction"; item: Task | Interaction; onSave: (action: () => Promise<unknown>) => void }) {
  return <form className="content-meta-form" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); onSave(() => patch(`/api/teacher/content/${entity}/${item.id}`, { title: data.get("title"), description: data.get("description"), order: Number(data.get("order")), isPublished: data.get("published") === "on" })); }}><label>标题<input name="title" defaultValue={item.title} required /></label><label>顺序<input min="1" name="order" type="number" defaultValue={item.order} required /></label><label className="content-description">说明<textarea name="description" defaultValue={item.description} /></label><label className="switch-field"><input name="published" type="checkbox" defaultChecked={item.isPublished} />学生可见</label><button title="保存内容"><Save />保存</button></form>;
}

function QuestionEditor({ question, onSave }: { question: Question; onSave: (action: () => Promise<unknown>) => void }) {
  const options = Array.isArray(question.options) ? question.options.map(String) : [];
  const correct = Array.isArray(question.correctAnswers) ? question.correctAnswers.map(String).join(",") : "";
  const feedback = Array.isArray(question.feedback) ? question.feedback.map(String) : [];
  return <details className="question-editor"><summary><span>{question.key}</span><b>{question.prompt}</b><em>v{question.version} · {question.isPublished ? "已发布" : "草稿"}</em></summary><form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); onSave(() => patch(`/api/teacher/questions/${question.id}`, { prompt: data.get("prompt"), options: String(data.get("options")).split("\n").map((item) => item.trim()).filter(Boolean), correctAnswers: String(data.get("correctAnswers")).split(",").map((item) => item.trim().toUpperCase()).filter(Boolean), feedback: String(data.get("feedback")).split("\n").map((item) => item.trim()).filter(Boolean), isPublished: data.get("published") === "on" })); }}><label>题干<textarea name="prompt" defaultValue={question.prompt} required /></label><label>选项（每行一项）<textarea name="options" defaultValue={options.join("\n")} required /></label><label>正确项（A,B）<input name="correctAnswers" defaultValue={correct} required /></label><label>反馈（每行一项）<textarea name="feedback" defaultValue={feedback.join("\n")} /></label><label className="switch-field"><input name="published" type="checkbox" defaultChecked={question.isPublished} />发布给学生</label><button><Save />发布新版本</button></form></details>;
}
