window.uploadDispenseFile = async function () {

  console.log("🔥 UPLOAD ZIP CLICKED");

  const fileInput = document.getElementById("dispenseZipFile");

  if (!fileInput || !fileInput.files.length) {
    alert("กรุณาเลือกไฟล์ ZIP หรือ Excel");
    return;
  }

  const file = fileInput.files[0];

  const formData = new FormData();
  formData.append("file", file);

  try {

    const res = await fetch("/api/dispense/upload", {
      method: "POST",
      body: formData
    });

    const result = await res.json();

    if (!result.ok) {
      alert(result.message || "Upload failed");
      return;
    }

    alert("Upload สำเร็จ");
    closeDispenseUploadModal();

  } catch (err) {
    console.error(err);
    alert("Upload error");
  }
};