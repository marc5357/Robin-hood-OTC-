console.log("Robin Hood OTC iniciado");

function gerarSinal(analise) {
  if (analise.includes("reversão") || analise.includes("martelo")) {
    return "Sinal: CALL";
  } else if (analise.includes("engolfo de baixa") || analise.includes("resistência")) {
    return "Sinal: PUT";
  } else {
    return "Sinal indefinido - aguarde confirmação";
  }
}

// Exemplo de uso
let exemploAnalise = "Zona de reversão detectada com padrão martelo";
let sinal = gerarSinal(exemploAnalise);
console.log(sinal);
