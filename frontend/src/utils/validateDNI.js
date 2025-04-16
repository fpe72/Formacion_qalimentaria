export default function isValidDNIorNIE(value) {
    if (!value || typeof value !== 'string') return false;
  
    const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
    let dni = value.toUpperCase().replace(/\s/g, '');
  
    if (/^[XYZ]\d{7}[A-Z]$/.test(dni)) {
      const numero = dni
        .replace('X', '0')
        .replace('Y', '1')
        .replace('Z', '2')
        .slice(0, -1);
      const letraEsperada = letras[parseInt(numero, 10) % 23];
      return dni[8] === letraEsperada;
    }
  
    if (/^\d{8}[A-Z]$/.test(dni)) {
      const numero = dni.slice(0, 8);
      const letraEsperada = letras[parseInt(numero, 10) % 23];
      return dni[8] === letraEsperada;
    }
  
    return false;
  }
  