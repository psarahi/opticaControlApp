import { formatearNumero } from "./formato";

export const obtenerGraduaciones = () => {
  let valores = [];
  let graduacionesFinales = [];
  let valoresPositivos = [];
  let valoresNegativos = [];

  for (let x = 0.25; x <= 20; ) {
    valores.push(formatearNumero(x));
    x += 0.25;
  }

  for (let y = 0; y < valores.length; y++) {
    valoresNegativos.push(parseFloat(`-${valores[y]}`).toFixed(2));
  }

  for (let z = 0; z < valores.length; z++) {
    valoresPositivos.push(`+${valores[z]}`);
  }

  graduacionesFinales = [...valoresNegativos.reverse(), "-0.00", ...valoresPositivos];

  return graduacionesFinales;
};

export const agudezaVisual = [
  "No. 1 20/200 0.05",
  "No. 2 20/100 0.12",
  "No. 3 20/70 0.2",
  "No. 4 20/50 0.25",
  "No. 5 20/40 0.3",
  "No. 6 20/30 0.4",
  "No. 7 20/25 0.5",
  "No. 8 20/20 0.8",
  "No. 9 20/15 1.0",
  "No. 10 20/13",
  "No. 11 20/10",
];

export const obtenerAdicion = () => {
  let adicion = [];

  for (let x = 1; x <= 3; ) {
    adicion.push(`+${formatearNumero(x)}`);
    x += 0.25;
  }
  return adicion.sort();
};
