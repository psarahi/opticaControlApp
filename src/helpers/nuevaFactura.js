export const nuevaFactura = (facVieja) => {
  let complemento = facVieja.substring(0, 11);
  let rango = facVieja.substring(11);
  let nuevoNum = parseInt(rango) + 1;
  let nuevaFactura = complemento + nuevoNum.toString().padStart(8, "0");
  return nuevaFactura;
};
