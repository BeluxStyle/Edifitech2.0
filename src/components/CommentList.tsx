import { IconButton, Tooltip, Box, Badge, Avatar, Typography, Modal, Button, TextField, Collapse } from "@mui/material";
import { ThumbUp, Reply, Delete } from "@mui/icons-material";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_REACTION, REPLY_COMMENT, DELETE_COMMENT } from "@/graphql/queries";
import moment from "moment";
import { useSession } from 'next-auth/react';
import ConfirmDialog from "./ConfirmDialog";
import useConfirm from "./../util/useConfirm"
import { useEffect, useMemo } from "react";



const reactionTypes = [
  { emoji: "👍", type: "like" },
  { emoji: "❤️", type: "love" },
  { emoji: "😮", type: "wow" }

];



const CommentsList = ({ comments, size }) => {
  const { data: session } = useSession();

  const { confirmData, showConfirm, closeConfirm } = useConfirm();
  const [openTooltip, setOpenTooltip] = useState(null);
  const [modalReply, setModalReply] = useState(false);
  const [newReply, setNewReply] = useState("");
  const [commentReply, setCommentReply] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [role, setRole] = useState(0);
      useEffect(() => {
          if (session) {
              setRole(session.user?.role?.level || 0);
          }
      }, [session]);

      const addAccess = useMemo(() => role >= 2, [role]);
      const adminAccess = useMemo(() => role >= 99, [role]);

  const [addReactionMutation] = useMutation(ADD_REACTION, {
    refetchQueries: ["GetComunidad", "GetEdificio"], // Para actualizar la UI después de reaccionar
  });
  const [replyComment] = useMutation(REPLY_COMMENT, {
    refetchQueries: ["GetComunidad", "GetEdificio"], // Para actualizar la UI después de reaccionar
  });

  const [deleteComment] = useMutation(DELETE_COMMENT, {
    refetchQueries: ["GetComunidad", "GetEdificio"], // Para actualizar la UI después de reaccionar
  });

  const handleReaction = async (commentId, reactionType) => {
    try {
      await addReactionMutation({
        variables: { commentId, type: reactionType }
      });
    } catch (error) {
      console.error("Error al reaccionar:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    console.log("Comentario Borrado", commentId)
    try {
      await deleteComment({
        variables: { id: commentId }
      });
      closeConfirm();
    } catch (error) {
      console.error("Error al borrar:", error);
    }
  }

  const handleReply = async () => {
    try {
      console.log("Respuesta comentario:", newReply);

      await replyComment({
        variables: { authorId: session?.user?.id, parentId: commentReply?.id, comment: newReply }
      });
      setModalReply(false);
      setNewReply("")
    } catch (error) {
      console.error("Error al reaccionar:", error);
    }
  };

  const toggleExpandReplies = (commentId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };


  const sortedComments = [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());




  return (
    <Box sx={{ maxHeight: size, overflow: "auto" }}>
      {sortedComments.length > 0 ? (
        sortedComments.map((comment) => (
          <Box key={comment.id}>
            {/* Comentario Principal */}
            <Box sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
              minHeight: 60,
              p: 1,
              borderBottom: "1px solid #ddd",
              "&:hover": { backgroundColor: "#f9f9f9" }
            }}>
              {/* Avatar del usuario */}
              <Avatar src={comment.author.image || "/default-avatar.png"} />

              <Box sx={{ flexGrow: 1, cursor: "pointer" }} onClick={() => toggleExpandReplies(comment.id)}>
                <Typography variant="subtitle2" color="secondary">
                  {comment.author.name} - {moment(comment.createdAt).fromNow()}
                </Typography>
                <Typography variant="body2">{comment.comment}</Typography>
              </Box>

              {/* Botones de acción */}
              <Box sx={{ display: "flex", mt: 3, gap: 1 }}>
                <Badge badgeContent={comment.replies?.length || 0} color="primary">
                  <IconButton size="small" disabled={!addAccess} onClick={() => { setModalReply(true); setCommentReply(comment); }}>
                    <Reply fontSize="small" />
                  </IconButton>
                </Badge>

                <Tooltip
                  title={
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      {reactionTypes.map(({ emoji, type }) => (
                        <Badge key={type} badgeContent={comment.reactions.filter(r => r.type === type).length} overlap="circular" color="primary">
                          <IconButton disabled={!addAccess} sx={{ fontSize: 20 }} onClick={() => handleReaction(comment.id, type)}>
                            {emoji}
                          </IconButton>
                        </Badge>
                      ))}
                    </Box>
                  }
                  open={openTooltip === comment.id}
                  onClose={() => setOpenTooltip(null)}
                  disableFocusListener
                  disableTouchListener
                >
                  <Badge badgeContent={comment.reactions.length} color="primary">
                    <IconButton disabled={comment.author.id === session?.user.id} size="small" onClick={() => setOpenTooltip(comment.id)}>
                      <ThumbUp sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Badge>
                </Tooltip>

                <IconButton disabled={adminAccess ? !adminAccess : comment.author.id !== session?.user.id} size="small" color="error" onClick={() => showConfirm("Eliminar Comentario", "¿Seguro que quieres eliminarlo?", () => handleDeleteComment(comment.id))}>
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Respuestas Anidadas (Colapsables) */}
            <Collapse in={expandedComments[comment.id]}>
              <Box sx={{ ml: 5, mt: 1, borderLeft: "2px solid #ddd", pl: 2 }}>
                {comment.replies?.map((reply) => (
                  <Box key={reply.id} sx={{ display: "flex", alignItems: "flex-start", gap: 2, p: 1, borderBottom: "1px solid #eee" }}>
                    <Avatar src={reply.author.image || "/default-avatar.png"} sx={{ width: 30, height: 30 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" color="secondary">
                        {reply.author.name} - {moment(reply.createdAt).fromNow()}
                      </Typography>
                      <Typography variant="body2">{reply.comment}</Typography>
                    </Box>
                    <IconButton disabled={adminAccess ? !adminAccess : reply.author.id !== session?.user.id} size="small" color="error" onClick={() => handleDeleteComment(reply.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="textSecondary">No hay comentarios recientes.</Typography>
      )}
      <Modal open={modalReply} onClose={() => setModalReply(false)}>
        <Box sx={{ p: 3, backgroundColor: "white", width: 400, margin: "auto", mt: 10 }}>
          <Typography variant="h6">Responder Comentario</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 2 }}
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
          />
          <Button variant="outlined" sx={{ mt: 2 }} onClick={handleReply}>Enviar</Button>
        </Box>
      </Modal>
      <ConfirmDialog
        open={confirmData.open}
        onClose={closeConfirm}
        onConfirm={confirmData.onConfirm}
        title={confirmData.title}
        message={confirmData.message}
      />
    </Box>
  );
};

export default CommentsList;
