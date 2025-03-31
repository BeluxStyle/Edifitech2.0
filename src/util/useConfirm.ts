import { useState } from "react";

const useConfirm = () => {
  const [confirmData, setConfirmData] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const showConfirm = (title, message, onConfirm) => {
    setConfirmData({ open: true, title, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmData((prev) => ({ ...prev, open: false }));
  };

  return {
    confirmData,
    showConfirm,
    closeConfirm,
  };
};

export default useConfirm;
