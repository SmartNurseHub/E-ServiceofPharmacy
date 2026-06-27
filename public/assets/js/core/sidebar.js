export function renderSidebar() {

  return `
  
  <div class="sidebar">

    <div class="logo">
      <i class="fa-solid fa-capsules"></i>
      Pharmacy System
    </div>

    <ul class="menu">

      <li>
        <a href="javascript:void(0)" data-page="dashboard">
          <i class="fa-solid fa-chart-line"></i>
          Dashboard
        </a>
      </li>

      <li>
        <a href="javascript:void(0)" data-page="pharmacy">
          <i class="fa-solid fa-pills"></i>
          Pharmacy
        </a>
      </li>

      <li>
        <a href="javascript:void(0)" data-page="receivedrug">
          <i class="fa-solid fa-truck-medical"></i>
          รับยาเข้าคลัง
        </a>
      </li>

      <!-- ✅ เพิ่มเมนู Drug Balance -->
      <li>
        <a href="javascript:void(0)" data-page="stockout">
          <i class="fa-solid fa-chart-pie"></i>
          Drug Balance
        </a>
      </li>

      <li>
        <a href="javascript:void(0)" data-page="reports">
          <i class="fa-solid fa-chart-column"></i>
          Reports
        </a>
      </li>

      <li>
        <a href="javascript:void(0)" data-page="settings">
          <i class="fa-solid fa-gear"></i>
          Settings
        </a>
      </li>

    </ul>

  </div>

  `;
}