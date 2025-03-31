import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

const ConfirmDialog = ({ open, onClose, onConfirm, title, message }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ textAlign: "center" }}>{title || "¿Estás seguro?"}</DialogTitle>
      <DialogContent sx={{ textAlign: "center" }}>
        <Typography>{message || "Esta acción no se puede deshacer."}</Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", gap: 2 }}>
        <Button onClick={onClose} color="error" variant="contained">Cancelar</Button>
        <Button onClick={onConfirm} color="success" variant="contained">Aceptar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
