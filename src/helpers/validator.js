export const textValidator = (value) => {
    if (value === undefined || value === null || value === '') {
        return false;
    } else {
        return true;
    }
};

export const validarFechaProxima = (date) => {
    const hoy = new Date();
    if (date < hoy) {
      return false;
    }
    return true;
  };
