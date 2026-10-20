import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  SquaresFour,
  Files,
  Flag,
  ShieldCheck,
  ClockCounterClockwise,
  Users,
  SignOut,
  ArrowRight,
  ArrowClockwise,
  DownloadSimple,
  MagnifyingGlass,
  X,
  CheckCircle,
  WarningCircle,
  Plus,
  ArrowsDownUp,
} from "@phosphor-icons/react";
import { api, download, type Row } from "./api";
import { ADMIN } from "./config";
import { Button } from "./components/ui/button";
import "./style.css";
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});
const money = (v: unknown) =>
  Number(v || 0).toLocaleString("vi-VN", { maximumFractionDigits: 2 });
const labels: Row = {
  RELEASE: "Đủ điều kiện",
  HOLD: "Tạm giữ",
  REJECT: "Từ chối",
  PENALTY: "Áp dụng phạt",
};
function Badge({ value }: { value: string }) {
  return <span className={`badge ${value}`}>{labels[value] || value}</span>;
}
function Table({
  data,
  columns,
  onRow,
}: {
  data: Row[];
  columns: ColumnDef<Row>[];
  onRow?: (r: Row) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  return (
    <div className="table-scroll">
      <table>
        <thead>
          {table.getHeaderGroups().map((g) => (
            <tr key={g.id}>
              {g.headers.map((h) => (
                <th key={h.id}>
                  <button
                    className="table-sort"
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getCanSort() && <ArrowsDownUp size={12} />}
                  </button>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((r) => (
            <tr key={r.id}>
              {r.getVisibleCells().map((c, i) => (
                <td key={c.id}>
                  {i === 0 && onRow ? (
                    <button
                      className="row-link"
                      onClick={() => onRow(r.original)}
                    >
                      {flexRender(c.column.columnDef.cell, c.getContext())}
                    </button>
                  ) : (
                    flexRender(c.column.columnDef.cell, c.getContext())
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!data.length && <div className="empty">Không có dữ liệu phù hợp.</div>}
    </div>
  );
}
function Login({ done }: { done: (u: Row) => void }) {
  const [username, setUsername] = useState(ADMIN ? "admin" : "buyer");
  const [password, setPassword] = useState("");
  const mutation = useMutation({
    mutationFn: async () => {
      const d = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      if (ADMIN && !["ADMIN", "AUDITOR"].includes(d.user.role))
        throw new Error("Cổng quản trị yêu cầu ADMIN hoặc AUDITOR");
      return d;
    },
    onSuccess: (d) => {
      sessionStorage.setItem("token", d.access_token);
      done(d.user);
    },
  });
  return (
    <main className="login">
      <section className="login-story">
        <div className="brand">
          <ShieldCheck size={30} /> ContractFlow
          <span> / {ADMIN ? "ADMIN" : "WORKSPACE"}</span>
        </div>
        <div>
          <span className="eyebrow">TỪ ĐIỀU KIỆN ĐẾN QUYẾT ĐỊNH</span>
          <h1>
            Mỗi khoản chi.
            <br />
            Một cơ sở rõ ràng.
          </h1>
          <p>
            Số hóa điều kiện hợp đồng, phối hợp phê duyệt và truy vết mọi quyết
            định trong một không gian.
          </p>
        </div>
        <small>FESTIVAL CHUYỂN ĐỔI SỐ 2026 · DỮ LIỆU GIẢ LẬP</small>
      </section>
      <section className="login-form">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <span className="eyebrow">
            {ADMIN ? "TRUNG TÂM ĐIỀU HÀNH" : "CỔNG CỘNG TÁC HỢP ĐỒNG"}
          </span>
          <h2>Chào mừng trở lại</h2>
          <p className="muted">Đăng nhập để tiếp tục công việc của bạn.</p>
          <label>
            Tài khoản
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            Mật khẩu
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {mutation.isError && (
            <p role="alert" className="error">
              {mutation.error.message}
            </p>
          )}
          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? "Đang đăng nhập…" : "Vào không gian làm việc"}
            <ArrowRight />
          </Button>
          <p className="login-note">
            Môi trường mô phỏng. Kết quả không phải quyết định thanh toán thực
            tế.
          </p>
        </form>
      </section>
    </main>
  );
}
function Detail({
  id,
  close,
  user,
}: {
  id: string;
  close: () => void;
  user: Row;
}) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["detail", id],
    queryFn: () => api("/milestones/" + id),
  });
  const [type, setType] = useState("APPROVAL");
  const [doc, setDoc] = useState("");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [eventKey, setEventKey] = useState(() => crypto.randomUUID());
  const [show, setShow] = useState(false);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", key);
    const before = document.activeElement as HTMLElement;
    const button = document.getElementById("close-detail");
    button?.focus();
    return () => {
      window.removeEventListener("keydown", key);
      before?.focus();
    };
  }, [close]);
  const mutation = useMutation({
    mutationFn: () => api(`/milestones/${id}/evaluate`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries(),
  });
  const event = useMutation({
    mutationFn: () =>
      api(`/milestones/${id}/events`, {
        method: "POST",
        body: JSON.stringify({
          event_type: type,
          document_id: doc,
          reference_event_id: reference,
          event_note: note,
          idempotency_key: eventKey,
        }),
      }),
    onSuccess: () => {
      setShow(false);
      setDoc("");
      setNote("");
      setEventKey(crypto.randomUUID());
      qc.invalidateQueries();
    },
  });
  const d = q.data;
  return (
    <div className="overlay" onClick={close}>
      <section
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Chi tiết milestone"
        onClick={(e) => {
          e.stopPropagation();
        }}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            const nodes = e.currentTarget.querySelectorAll<HTMLElement>(
              "button:not(:disabled),input,select,textarea,a[href]",
            );
            const first = nodes[0],
              last = nodes[nodes.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }}
      >
        <div className="section-head">
          <span className="eyebrow">CHI TIẾT MILESTONE</span>
          <button
            id="close-detail"
            className="icon-button"
            onClick={close}
            aria-label="Đóng"
          >
            <X size={22} />
          </button>
        </div>
        {q.isLoading ? (
          <p>Đang tải…</p>
        ) : q.error ? (
          <p className="error">{q.error.message}</p>
        ) : (
          d && (
            <>
              <div className="muted">
                {d.contract.contract_id} / {id}
              </div>
              <h2>{d.milestone.milestone_name}</h2>
              <Badge value={d.decision.predicted_decision} />
              <div className="decision-box">
                <p>{d.decision.decision_reason}</p>
                <strong>
                  {money(d.decision.payable_amount_vnd_mn)}{" "}
                  <small>triệu VND đủ điều kiện</small>
                </strong>
                <p className="muted">
                  Kế hoạch {money(d.milestone.planned_payment_vnd_mn)} · Phạt{" "}
                  {money(d.decision.penalty_amount_vnd_mn)} · Hạn{" "}
                  {d.milestone.due_date}
                </p>
              </div>
              <h3>Điều kiện & phê duyệt</h3>
              <p>{d.milestone.required_event_types.replaceAll(";", " + ")}</p>
              <p className="muted">
                Quorum: {d.decision.diagnostics?.valid_approval_count || 0}/
                {d.milestone.required_approval_quorum} ·{" "}
                {d.milestone.required_approval_roles || "Không yêu cầu"}
              </p>
              {d.decision.missing_conditions && (
                <p className="error">
                  Cần xử lý: {d.decision.missing_conditions}
                </p>
              )}
              <div className="actions">
                {user.role !== "AUDITOR" && (
                  <Button
                    disabled={mutation.isPending}
                    onClick={() => mutation.mutate()}
                  >
                    <ArrowClockwise />
                    Lưu đánh giá
                  </Button>
                )}
                {["BUYER", "SUPPLIER", "APPROVER"].includes(user.role) && (
                  <Button variant="outline" onClick={() => setShow(!show)}>
                    <Plus />
                    Tạo sự kiện
                  </Button>
                )}
              </div>
              {(mutation.error || event.error) && (
                <p className="error" role="alert">
                  {(mutation.error || event.error)?.message}
                </p>
              )}
              {mutation.isSuccess && (
                <p className="success">Đã lưu đánh giá và audit trace.</p>
              )}
              {show && (
                <form
                  className="event-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    event.mutate();
                  }}
                >
                  <label>
                    Loại sự kiện
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      {[
                        "APPROVAL",
                        "REJECTION",
                        "DELIVERY",
                        "INVOICE",
                        "ACCEPTANCE",
                        "CONTRACT_SIGNED",
                        "DISPUTE_OPENED",
                        "DISPUTE_RESOLVED",
                        "UAT_PASSED",
                        "GO_LIVE",
                        "WARRANTY_COMPLETED",
                        "SERVICE_COMPLETED",
                        "SERVICE_ACTIVATED",
                        "KICKOFF_CONFIRMED",
                        "REQUIREMENTS_APPROVED",
                      ].map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Mã chứng từ
                    <input
                      required
                      value={doc}
                      onChange={(e) => setDoc(e.target.value)}
                    />
                  </label>
                  {type === "DISPUTE_RESOLVED" && (
                    <label>
                      Event dispute tham chiếu
                      <input
                        required
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                      />
                    </label>
                  )}
                  <label>
                    Ghi chú
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </label>
                  <Button disabled={event.isPending}>Gửi bằng chứng</Button>
                </form>
              )}
              <h3>
                Bằng chứng sự kiện{" "}
                <span className="muted">({d.events.length})</span>
              </h3>
              <div className="timeline">
                {d.events.map((e: Row) => (
                  <article key={e.event_id}>
                    <CheckCircle size={18} />
                    <div>
                      <strong>{e.event_type}</strong>
                      <small>
                        {e.event_id} · {e.actor_party_id} · {e.event_status}
                      </small>
                      <small>
                        {e.document_id} ·{" "}
                        {new Date(e.event_timestamp).toLocaleString("vi-VN")}
                      </small>
                    </div>
                  </article>
                ))}
              </div>
              <h3>First-match rule trace</h3>
              {d.decision.trace.map((t: Row) => (
                <div className="trace" key={t.rule_id}>
                  <span>
                    {t.priority} / {t.rule_id}
                  </span>
                  <code>{t.reason_code}</code>
                  <span className={t.matched ? "success" : "muted"}>
                    {t.matched ? "Khớp" : "Bỏ qua"}
                  </span>
                </div>
              ))}
              <h3>Lịch sử đánh giá ({d.audit.length})</h3>
              {d.audit.map((a: Row) => (
                <p className="audit-entry" key={a.audit_trace_id}>
                  <Badge value={a.predicted_decision} />
                  <small>
                    {a.actor} ·{" "}
                    {new Date(a.evaluated_at).toLocaleString("vi-VN")}
                    <br />
                    {a.audit_trace_id}
                  </small>
                </p>
              ))}
            </>
          )
        )}
      </section>
    </div>
  );
}
function Workspace({ user, logout }: { user: Row; logout: () => void }) {
  const [page, setPage] = useState("overview");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [contract, setContract] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const qc = useQueryClient();
  const cq = useQuery({
    queryKey: ["contracts"],
    queryFn: () => api<Row[]>("/contracts"),
  });
  const mq = useQuery({
    queryKey: ["milestones"],
    queryFn: () => api<Row[]>("/milestones"),
  });
  const extra = useQuery({
    queryKey: [page],
    queryFn: () => api<Row[]>("/" + page),
    enabled: ["rules", "parties", "audit"].includes(page),
  });
  const batch = useMutation({
    mutationFn: () => api("/evaluate-all", { method: "POST" }),
    onSuccess: (d) => {
      setNotice(`Đã lưu đánh giá ${d.evaluated} milestone.`);
      qc.invalidateQueries();
    },
    onError: (e) => setNotice(e.message),
  });
  const ms = mq.data || [];
  const cs = cq.data || [];
  const counts = Object.fromEntries(
    ["RELEASE", "HOLD", "PENALTY", "REJECT"].map((k) => [
      k,
      ms.filter((m) => m.decision.predicted_decision === k).length,
    ]),
  );
  const total = ms.reduce((s, m) => s + Number(m.planned_payment_vnd_mn), 0);
  const payable = ms.reduce(
    (s, m) => s + Number(m.decision.payable_amount_vnd_mn),
    0,
  );
  const nav = [
    { id: "overview", text: "Tổng quan", icon: SquaresFour },
    { id: "contracts", text: "Hợp đồng", icon: Files },
    { id: "milestones", text: "Milestone", icon: Flag },
    ...(ADMIN
      ? [
          { id: "rules", text: "Bộ quy tắc", icon: ShieldCheck },
          { id: "parties", text: "Các bên tham gia", icon: Users },
          {
            id: "audit",
            text: "Nhật ký kiểm tra",
            icon: ClockCounterClockwise,
          },
        ]
      : []),
  ];
  const columns: ColumnDef<Row>[] = [
    {
      accessorKey: "milestone_id",
      header: "Mã milestone",
      cell: (i) => <strong>{String(i.getValue())}</strong>,
    },
    {
      accessorKey: "milestone_name",
      header: "Nội dung",
      cell: (i) => (
        <div>
          {String(i.getValue())}
          <small>
            {i.row.original.contract_id} · {i.row.original.milestone_type}
          </small>
        </div>
      ),
    },
    { accessorKey: "due_date", header: "Hạn hoàn thành" },
    {
      accessorKey: "planned_payment_vnd_mn",
      header: "Kế hoạch (tr. VND)",
      cell: (i) => money(i.getValue()),
    },
    {
      id: "decision",
      accessorFn: (r) => r.decision.predicted_decision,
      header: "Quyết định",
      cell: (i) => <Badge value={String(i.getValue())} />,
    },
    {
      id: "payable",
      accessorFn: (r) => Number(r.decision.payable_amount_vnd_mn),
      header: "Đủ điều kiện (tr.)",
      cell: (i) => <strong>{money(i.getValue())}</strong>,
    },
  ];
  const shown = ms.filter(
    (m) =>
      (filter === "ALL" || m.decision.predicted_decision === filter) &&
      (!contract || m.contract_id === contract) &&
      `${m.milestone_id} ${m.contract_id} ${m.milestone_name}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const chart = Object.entries(counts).map(([name, value]) => ({
    name: labels[name],
    value,
  }));
  const go = (id: string) => {
    setPage(id);
    setSearch("");
    setContract("");
    setFilter("ALL");
  };
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <ShieldCheck size={29} />
          ContractFlow
        </div>
        <div className="workspace-label">
          {ADMIN ? "TRUNG TÂM ĐIỀU HÀNH" : "KHÔNG GIAN CỘNG TÁC"}
        </div>
        <nav>
          {nav.map((n) => (
            <button
              className={page === n.id ? "active" : ""}
              key={n.id}
              onClick={() => go(n.id)}
            >
              <n.icon size={20} />
              {n.text}
              {n.id === "contracts" && <span>{cs.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="simulation">
            <span className="dot" />
            Môi trường mô phỏng<p>Không thực hiện giao dịch tiền.</p>
          </div>
          <div className="profile">
            <div className="avatar">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <strong>{user.username}</strong>
              <small>
                {user.role} {user.party_id && `· ${user.party_id}`}
              </small>
            </div>
            <button
              className="icon-button"
              onClick={logout}
              aria-label="Đăng xuất"
            >
              <SignOut size={20} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main">
        <header>
          <div>
            <span className="muted">Workspace</span>
            <span className="breadcrumb">/</span>
            {nav.find((n) => n.id === page)?.text}
          </div>
          <div className="header-status">
            <span className="dot" />
            Dữ liệu giả lập · snapshot 18/10/2026
          </div>
        </header>
        <main className="content">
          <div className="page-head">
            <div>
              <span className="eyebrow">
                CONTRACT OPERATIONS / {ADMIN ? "ADMIN" : "PORTAL"}
              </span>
              <h1>
                {nav.find((n) => n.id === page)?.text}
                {page === "overview" && <span className="heading-dot">.</span>}
              </h1>
              <p className="muted">
                {page === "overview"
                  ? "Nắm tiến độ, nhận diện điểm nghẽn, truy vết quyết định."
                  : page === "rules"
                    ? "Rule được áp dụng theo priority tăng dần, dừng tại điều kiện đầu tiên khớp."
                    : "Dữ liệu trong phạm vi quyền truy cập của bạn."}
              </p>
            </div>
            <div className="actions">
              {ADMIN && (
                <Button
                  variant="outline"
                  onClick={() => download().catch((e) => setNotice(e.message))}
                >
                  <DownloadSimple />
                  Xuất CSV
                </Button>
              )}
              {user.role === "ADMIN" && (
                <Button
                  disabled={batch.isPending}
                  onClick={() => batch.mutate()}
                >
                  <ArrowClockwise />
                  {batch.isPending ? "Đang đánh giá…" : "Đánh giá tất cả"}
                </Button>
              )}
            </div>
          </div>
          {notice && (
            <div className="notice" role="status">
              {notice}
              <button onClick={() => setNotice("")} aria-label="Ẩn thông báo">
                <X />
              </button>
            </div>
          )}
          {(mq.error || cq.error) && (
            <p role="alert" className="error">
              {(mq.error || cq.error)?.message}
              <Button variant="outline" onClick={() => qc.invalidateQueries()}>
                Thử lại
              </Button>
            </p>
          )}
          {mq.isLoading || cq.isLoading ? (
            <div className="empty">
              Đang tải và kiểm tra điều kiện hợp đồng…
            </div>
          ) : (
            <>
              {page === "overview" && (
                <>
                  <div className="stats">
                    <article>
                      <span>Hợp đồng đang theo dõi</span>
                      <strong>
                        {cs.length}
                        <small>hợp đồng</small>
                      </strong>
                      <p>{ms.length} milestone trong phạm vi truy cập</p>
                    </article>
                    <article>
                      <span>Giá trị theo kế hoạch</span>
                      <strong>
                        {money(total)}
                        <small>triệu VND</small>
                      </strong>
                      <p>Tổng giá trị các milestone</p>
                    </article>
                    <article className="stat-green">
                      <span>Đủ điều kiện thanh toán</span>
                      <strong>
                        {money(payable)}
                        <small>triệu VND</small>
                      </strong>
                      <p>
                        {counts.RELEASE + counts.PENALTY} milestone đủ điều kiện
                        sau kiểm tra
                      </p>
                    </article>
                    <article>
                      <span>Milestone cần xử lý</span>
                      <strong>
                        {counts.HOLD + counts.REJECT}
                        <small>milestone</small>
                      </strong>
                      <p>
                        {counts.HOLD} tạm giữ · {counts.REJECT} từ chối
                      </p>
                    </article>
                  </div>
                  <div className="overview-grid">
                    <section className="panel">
                      <div className="section-head">
                        <div>
                          <h3>Phân bố quyết định</h3>
                          <p className="muted">
                            Kết quả kiểm tra điều kiện hiện tại
                          </p>
                        </div>
                        <span className="live-label">LIVE EVALUATION</span>
                      </div>
                      <div className="chart">
                        <ResponsiveContainer width="100%" height={180}>
                          <AreaChart data={chart}>
                            <XAxis
                              dataKey="name"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 11 }}
                            />
                            <YAxis
                              allowDecimals={false}
                              axisLine={false}
                              tickLine={false}
                              width={30}
                            />
                            <Tooltip />
                            <Area
                              type="linear"
                              dataKey="value"
                              name="Milestone"
                              stroke="#247a65"
                              fill="#e2f1e9"
                              strokeWidth={2}
                              isAnimationActive={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="legend">
                        {Object.entries(counts).map(([k, v]) => (
                          <button
                            key={k}
                            onClick={() => {
                              setPage("milestones");
                              setFilter(k);
                            }}
                          >
                            <span className={`status-dot ${k}`} />
                            {labels[k]}
                            <strong>{v}</strong>
                          </button>
                        ))}
                      </div>
                    </section>
                    <section className="panel attention">
                      <WarningCircle size={26} />
                      <h3>Ưu tiên xử lý điểm nghẽn</h3>
                      <p>
                        Milestone tạm giữ cần bổ sung bằng chứng, hoàn tất phê
                        duyệt hoặc giải quyết tranh chấp.
                      </p>
                      <div className="attention-number">
                        {counts.HOLD}
                        <span>milestone đang tạm giữ</span>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setPage("milestones");
                          setFilter("HOLD");
                        }}
                      >
                        Xem danh sách cần xử lý
                        <ArrowRight />
                      </Button>
                    </section>
                  </div>
                </>
              )}
              {["overview", "milestones"].includes(page) && (
                <section className="panel data-panel">
                  <div className="section-head">
                    <div>
                      <h3>
                        {page === "overview"
                          ? "Theo dõi milestone"
                          : "Danh sách milestone"}
                      </h3>
                      <p className="muted">
                        Chọn mã milestone để xem bằng chứng và rule trace.
                      </p>
                    </div>
                    <span className="count-label">{shown.length} kết quả</span>
                  </div>
                  <div className="toolbar">
                    <label className="search">
                      <MagnifyingGlass size={18} />
                      <input
                        aria-label="Tìm milestone"
                        placeholder="Tìm hợp đồng, milestone…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </label>
                    <select
                      aria-label="Lọc quyết định"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="ALL">Tất cả quyết định</option>
                      {Object.keys(labels).map((k) => (
                        <option key={k} value={k}>
                          {labels[k]}
                        </option>
                      ))}
                    </select>
                    {contract && (
                      <Button variant="outline" onClick={() => setContract("")}>
                        Bỏ lọc {contract}
                        <X />
                      </Button>
                    )}
                  </div>
                  <Table
                    data={page === "overview" ? shown.slice(0, 12) : shown}
                    columns={columns}
                    onRow={(r) => setSelected(r.milestone_id)}
                  />
                  {page === "overview" && (
                    <button
                      className="table-footer"
                      onClick={() => go("milestones")}
                    >
                      Xem toàn bộ {ms.length} milestone
                      <ArrowRight size={16} />
                    </button>
                  )}
                </section>
              )}
              {page === "contracts" && (
                <section className="panel data-panel">
                  <div className="toolbar">
                    <label className="search">
                      <MagnifyingGlass />
                      <input
                        aria-label="Tìm hợp đồng"
                        placeholder="Tìm tên hoặc mã hợp đồng…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </label>
                  </div>
                  <Table
                    data={cs.filter((c) =>
                      `${c.contract_id} ${c.contract_title}`
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                    )}
                    columns={[
                      { accessorKey: "contract_id", header: "Mã hợp đồng" },
                      { accessorKey: "contract_title", header: "Tên hợp đồng" },
                      { accessorKey: "contract_type", header: "Loại" },
                      { accessorKey: "buyer_id", header: "Bên mua" },
                      { accessorKey: "supplier_id", header: "Nhà cung cấp" },
                      {
                        accessorKey: "contract_value_vnd_mn",
                        header: "Giá trị (tr.)",
                        cell: (i) => money(i.getValue()),
                      },
                    ]}
                    onRow={(r) => {
                      setContract(r.contract_id);
                      setPage("milestones");
                    }}
                  />
                </section>
              )}
              {["rules", "parties", "audit"].includes(page) && (
                <section className="panel data-panel">
                  {extra.isLoading ? (
                    <div className="empty">Đang tải…</div>
                  ) : extra.error ? (
                    <p className="error">{extra.error.message}</p>
                  ) : (
                    <Table
                      data={extra.data || []}
                      columns={(page === "rules"
                        ? [
                            ["rule_id", "Mã rule"],
                            ["release_rule_code", "Nhóm milestone"],
                            ["priority", "Priority"],
                            ["condition_expression", "Điều kiện"],
                            ["decision", "Quyết định"],
                            ["reason_code", "Mã lý do"],
                          ]
                        : page === "parties"
                          ? [
                              ["party_id", "Mã"],
                              ["party_name", "Tên tổ chức / người duyệt"],
                              ["party_type", "Loại"],
                              ["parent_party_id", "Tổ chức"],
                              ["approval_role", "Vai trò"],
                              ["status", "Trạng thái"],
                            ]
                          : [
                              ["audit_trace_id", "Audit trace"],
                              ["milestone_id", "Milestone"],
                              ["actor", "Người thực hiện"],
                              ["predicted_decision", "Quyết định"],
                              ["evaluated_at", "Thời điểm"],
                              ["reason_code", "Lý do"],
                            ]
                      ).map(([key, name]) => ({
                        accessorKey: key,
                        header: name,
                        cell: (i) =>
                          ["decision", "predicted_decision"].includes(key) ? (
                            <Badge value={String(i.getValue())} />
                          ) : (
                            String(i.getValue() ?? "")
                          ),
                      }))}
                      onRow={
                        page === "audit"
                          ? (r) => setSelected(r.milestone_id)
                          : undefined
                      }
                    />
                  )}
                </section>
              )}
            </>
          )}
          <footer>
            ContractFlow · Contract → Milestone → Event → Rule Check → Decision
            → Audit Log <span>Đơn vị tiền: triệu VND</span>
          </footer>
        </main>
      </div>
      {selected && (
        <Detail
          key={selected}
          id={selected}
          user={user}
          close={() => setSelected(null)}
        />
      )}
    </div>
  );
}
function App() {
  const [user, setUser] = useState<Row | null>(null);
  const [checking, setChecking] = useState(!!sessionStorage.getItem("token"));
  useEffect(() => {
    const clear = () => {
      setUser(null);
      queryClient.clear();
    };
    window.addEventListener("session-expired", clear);
    if (sessionStorage.getItem("token"))
      api("/auth/me")
        .then((u) => {
          if (ADMIN && !["ADMIN", "AUDITOR"].includes(u.role))
            throw Error("Forbidden");
          setUser(u);
        })
        .catch(() => sessionStorage.removeItem("token"))
        .finally(() => setChecking(false));
    return () => window.removeEventListener("session-expired", clear);
  }, []);
  if (checking) return <div className="empty">Đang khôi phục phiên…</div>;
  return user ? (
    <Workspace
      user={user}
      logout={() => {
        sessionStorage.removeItem("token");
        queryClient.clear();
        setUser(null);
      }}
    />
  ) : (
    <Login done={setUser} />
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
