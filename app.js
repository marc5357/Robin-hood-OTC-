
function gerarAnalise() {
  const sinais = ["CALL", "PUT", "AGUARDE"];
  const aleatorio = sinais[Math.floor(Math.random() * sinais.length)];
  
  const output = document.getElementById("sinal");
  output.innerText = `SINAL: ${aleatorio}`;
}
