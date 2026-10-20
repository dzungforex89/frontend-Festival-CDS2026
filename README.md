<<<<<<< HEAD
# frontend-Festival-CDS2026
=======
# ContractFlow Frontend

Cổng cộng tác hợp đồng cho BUYER, SUPPLIER, APPROVER và AUDITOR. Repo độc lập dùng Vite + React + TypeScript, Tailwind 4, shadcn-style Button dựa trên Radix Slot, TanStack Query/Table, Recharts và Phosphor.

## Chạy

Yêu cầu Node 22+, backend chạy ở http://127.0.0.1:8000.

```powershell
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run dev
```

Mở http://localhost:5173. Username demo: `buyer`, `supplier`, `approver`, `auditor`; mật khẩu theo `DEMO_PASSWORD` backend (mặc định `ContractFlowDemo2026!`). Không có dữ liệu giả hard-code trong giao diện; API lỗi sẽ hiển thị lỗi.

## Luồng demo

1. Đăng nhập buyer để thấy các hợp đồng của B009.
2. Xem dashboard, lọc quyết định, tìm milestone hoặc mở hợp đồng.
3. Chọn **mã milestone** để xem bằng chứng, quorum, rule trace, payable và penalty.
4. **Lưu đánh giá** để tạo audit; **Tạo sự kiện** để gửi acceptance, dispute hoặc bằng chứng khác trong quyền của actor. Server từ chối loại event ngoài quyền.
5. Đăng nhập supplier/approver để thử quyền của các bên. Auditor chỉ đọc.

`VITE_API_URL` mặc định `/api`, Vite proxy sang backend. Khi deploy static, đặt `VITE_API_URL=https://api.example.com` trước build và thêm origin frontend vào CORS backend; hoặc cấu hình reverse proxy `/api`.

```powershell
npm.cmd run build
npm.cmd run preview
```

Preview chỉ phục vụ file build; cần VITE_API_URL tuyệt đối hoặc reverse proxy API. JWT được lưu sessionStorage, xóa khi logout/401 và hết hạn sau 2 giờ. Token của user mới không dùng lại query cache user trước.

Giao diện tiếng Việt, desktop/mobile responsive, trạng thái loading/error/empty, table sorting, keyboard focus và dialog focus trap. Môi trường hiện tại chưa có browser kết nối để xác nhận visual QA.

`src/config.ts` đặt ADMIN=false. Repo admin có cùng nền tảng nhưng được build/deploy độc lập và bật các màn quản trị. Không phụ thuộc filesystem của repo khác.

Tài liệu: [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview).
>>>>>>> 7f0a606 (Build contract collaboration portal with live API integration)
