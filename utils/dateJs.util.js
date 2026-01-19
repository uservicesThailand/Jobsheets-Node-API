const formatDate = (date = new Date(), withTime = false) => {
  const day = date.getDate().toString().padStart(2, "0"); // วันที่ 2 หลัก
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // เดือน 2 หลัก (0-11 เลย +1)
  const year = date.getFullYear();

  if (withTime) {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } else {
    return `${day}/${month}/${year}`;
  }
};

module.exports = { formatDate };
