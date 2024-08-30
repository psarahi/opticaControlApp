export const textValidator = (value) => {
    if (value === undefined || value === null || value === '') {
        return 'Favor ingrese los datos obligatorios';
    } 
};
