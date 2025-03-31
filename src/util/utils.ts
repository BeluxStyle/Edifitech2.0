

export function hashCode(str: string) { // java String#hashCode
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 6) - hash);
  }
  return hash;
}

export function intToRGB(i) {
  const c = (i & 0x00FFFFFF)
    .toString(16)
    .toUpperCase();

  return "00000".substring(0, 6 - c.length) + c;
}

export function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

export function stringAvatar(name: string) {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
  };
}

export const copyRowToClipboard = (row: any) => {
  // Filtrar las propiedades para excluir "id"
  const filteredValues = Object.entries(row)
    .filter(([key]) => key !== "id") // Excluye la propiedad "id"
    .map(([, value]) => value); // Obtiene solo los valores

  // Convierte los valores en texto separado por tabulaciones
  let rowText = filteredValues.join("\t");

  if (row.__typename === "Contacto") {
    console.log(row);
    rowText = `${row.__typename} ${row.type}: ${row.name}, Teléfono: ${row.phone}, ${row.location}`;
  }

  // Copia el texto al portapapeles
  navigator.clipboard.writeText(rowText).then(() => {
    return rowText;
  });
};

export const shareRowOnWhatsApp = (row: any) => {
  // Filtrar las propiedades para excluir "id"
  const filteredValues = Object.entries(row)
    .filter(([key]) => key !== "id") // Excluye la propiedad "id"
    .map(([key, value]) => `${key}: ${value}`); // Formato clave-valor

  // Texto base con formato
  let rowText = filteredValues.join("\n"); // Separar cada clave-valor por una nueva línea

  // Si es un contacto, aplicar un formato especial
  if (row.__typename === "Contacto") {
    rowText = `
*Información de Contacto*
${row.comunidad ? `*${row.comunidad.name}*` : row.edificio ? `*${row.edificio.comunidad?.name || "-"} ${row.edificio.name}*` : ""}
-------------------------
*-Nombre:* ${row.name}
*-Cargo:* ${row.type}
*-Teléfono:* ${row.phone}
*-Ubicación:* ${row.location}
  `.trim();
  }

  // Codificar el texto para el enlace de WhatsApp
  const encodedMessage = encodeURIComponent(rowText);

  // Construir el enlace de WhatsApp
  const whatsappLink = `https://wa.me/?text=${encodedMessage}`;

   // Abrir el enlace en una nueva pestaña
   const newWindow = window.open(whatsappLink, "_blank", "noopener,noreferrer");

   // Intentar cerrar la pestaña si no se usa (opcional, para escritorio)
   if (newWindow) {
     setTimeout(() => {
       newWindow.close();
     }, 1000); // Cierra la pestaña después de 5 segundos si no se usa
   }
};