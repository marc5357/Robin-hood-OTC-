// Variáveis globais
let historicoAnalises = [];
let ultimoParAnalisado = '';
let intervaloDaSimulacao = null;
let dadosGrafico = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  inicializarGrafico();
  // Inicia a análise automática com o par selecionado por padrão
  setTimeout(() => {
    analisarAutomaticamente();
  }, 1000);
});

// Função para gerar análise quando o botão é clicado
function gerarAnalise() {
  const parDeMoedas = document.getElementById('currency-pair').value;
  realizarAnalise(parDeMoedas, true);
}

// Função para analisar automaticamente quando o par de moedas é alterado
function analisarAutomaticamente() {
  const parDeMoedas = document.getElementById('currency-pair').value;
  if (parDeMoedas !== ultimoParAnalisado) {
    ultimoParAnalisado = parDeMoedas;
    atualizarStatus("Analisando " + parDeMoedas + "...");
    setTimeout(() => {
      realizarAnalise(parDeMoedas, false);
    }, 1500);
  }
}

// Função principal de análise
function realizarAnalise(parDeMoedas, foiManual) {
  // Resetar elementos visuais
  document.getElementById('patterns-list').innerHTML = '<li>Processando padrões...</li>';
  document.getElementById('sinal').innerText = 'SINAL: ANALISANDO';
  document.getElementById('sinal').className = '';
  document.getElementById('signal-reason').innerText = 'Processando dados do mercado...';
  
  // Simular processamento
  setTimeout(() => {
    // Gerar dados de análise baseados no par de moedas
    const analise = gerarDadosDeAnalise(parDeMoedas);
    
    // Atualizar interface com os resultados
    atualizarInterface(analise, parDeMoedas);
    
    // Adicionar ao histórico
    adicionarAoHistorico(analise, parDeMoedas, foiManual);
    
    // Atualizar gráfico
    atualizarGrafico(analise);
  }, 2000);
}

// Função para gerar dados de análise baseados no par de moedas
function gerarDadosDeAnalise(parDeMoedas) {
  // Aqui seria integrada uma API real de análise de mercado
  // Por enquanto, vamos simular com dados pseudo-aleatórios mas consistentes por par
  
  // Usar o nome do par como seed para pseudo-aleatoriedade consistente
  const seed = hashString(parDeMoedas);
  const random = seededRandom(seed);
  
  // Determinar tendência com base no par
  let tendencia;
  if (random() > 0.5) {
    tendencia = "ALTA";
  } else {
    tendencia = "BAIXA";
  }
  
  // Determinar volatilidade
  const volatilidade = ["BAIXA", "MÉDIA", "ALTA"][Math.floor(random() * 3)];
  
  // Gerar padrões identificados
  const possiveisPadroes = [
    "Suporte e Resistência",
    "Cruzamento de Médias Móveis",
    "Divergência RSI",
    "Padrão de Vela Doji",
    "Padrão de Vela Martelo",
    "Padrão de Vela Engolfo",
    "Triângulo Ascendente",
    "Triângulo Descendente",
    "Bandeira de Alta",
    "Bandeira de Baixa",
    "Ombro-Cabeça-Ombro",
    "Duplo Topo",
    "Duplo Fundo"
  ];
  
  const numPadroes = 1 + Math.floor(random() * 3); // 1 a 3 padrões
  const padroes = [];
  
  for (let i = 0; i < numPadroes; i++) {
    const indice = Math.floor(random() * possiveisPadroes.length);
    if (!padroes.includes(possiveisPadroes[indice])) {
      padroes.push(possiveisPadroes[indice]);
    }
  }
  
  // Determinar sinal com base nos padrões e tendência
  let sinal;
  let razao;
  
  if (tendencia === "ALTA" && (padroes.includes("Cruzamento de Médias Móveis") || padroes.includes("Padrão de Vela Martelo") || padroes.includes("Triângulo Ascendente"))) {
    sinal = "CALL";
    razao = `Recomendação de CALL baseada na tendência de ${tendencia} e nos padrões ${padroes.join(", ")}. A volatilidade ${volatilidade} sugere momento favorável para entrada.`;
  } else if (tendencia === "BAIXA" && (padroes.includes("Padrão de Vela Doji") || padroes.includes("Ombro-Cabeça-Ombro") || padroes.includes("Duplo Topo"))) {
    sinal = "PUT";
    razao = `Recomendação de PUT baseada na tendência de ${tendencia} e nos padrões ${padroes.join(", ")}. A volatilidade ${volatilidade} indica potencial de queda.`;
  } else {
    sinal = "AGUARDE";
    razao = `Recomendação de AGUARDE devido a sinais mistos. Tendência de ${tendencia} com volatilidade ${volatilidade}, mas os padrões ${padroes.join(", ")} não indicam momento ideal para entrada.`;
  }
  
  return {
    tendencia,
    volatilidade,
    padroes,
    sinal,
    razao,
    timestamp: new Date().toLocaleTimeString()
  };
}

// Função para atualizar a interface com os resultados da análise
function atualizarInterface(analise, parDeMoedas) {
  // Atualizar tendência e volatilidade
  document.getElementById('market-trend').innerText = `Tendência: ${analise.tendencia}`;
  document.getElementById('market-volatility').innerText = `Volatilidade: ${analise.volatilidade}`;
  
  // Atualizar padrões identificados
  const padroesHTML = analise.padroes.map(padrao => `<li>${padrao}</li>`).join('');
  document.getElementById('patterns-list').innerHTML = padroesHTML;
  
  // Atualizar sinal e razão
  const sinalElement = document.getElementById('sinal');
  sinalElement.innerText = `SINAL: ${analise.sinal}`;
  
  // Adicionar classe CSS baseada no sinal
  sinalElement.className = '';
  if (analise.sinal === "CALL") {
    sinalElement.classList.add('call');
  } else if (analise.sinal === "PUT") {
    sinalElement.classList.add('put');
  } else {
    sinalElement.classList.add('wait');
  }
  
  document.getElementById('signal-reason').innerText = analise.razao;
}

// Função para adicionar análise ao histórico
function adicionarAoHistorico(analise, parDeMoedas, foiManual) {
  const tipoAnalise = foiManual ? "manual" : "automática";
  const entradaHistorico = `${analise.timestamp} - ${parDeMoedas}: ${analise.sinal} (Análise ${tipoAnalise})`;
  
  historicoAnalises.unshift(entradaHistorico);
  if (historicoAnalises.length > 10) {
    historicoAnalises.pop(); // Manter apenas as 10 análises mais recentes
  }
  
  // Atualizar a exibição do histórico
  const historicoHTML = historicoAnalises.map(entrada => `<p>${entrada}</p>`).join('');
  document.getElementById('analysis-history').innerHTML = historicoHTML || '<p>Nenhuma análise realizada</p>';
}

// Função para atualizar status
function atualizarStatus(mensagem) {
  document.getElementById('sinal').innerText = mensagem;
  document.getElementById('sinal').className = 'wait';
}

// Funções para simulação de gráfico
function inicializarGrafico() {
  const canvas = document.getElementById('chart-simulation');
  
  // Gerar dados iniciais
  dadosGrafico = [];
  for (let i = 0; i < 50; i++) {
    dadosGrafico.push(50 + Math.random() * 30 - 15);
  }
  
  // Iniciar simulação
  if (intervaloDaSimulacao) {
    clearInterval(intervaloDaSimulacao);
  }
  
  intervaloDaSimulacao = setInterval(() => {
    // Adicionar novo ponto
    const ultimoPonto = dadosGrafico[dadosGrafico.length - 1];
    const novoPonto = ultimoPonto + (Math.random() * 4 - 2);
    dadosGrafico.push(novoPonto);
    
    // Remover ponto mais antigo
    if (dadosGrafico.length > 50) {
      dadosGrafico.shift();
    }
    
    // Desenhar gráfico
    desenharGrafico();
  }, 1000);
  
  // Desenhar gráfico inicial
  desenharGrafico();
}

function desenharGrafico() {
  const container = document.getElementById('chart-simulation');
  container.innerHTML = '';
  
  // Encontrar valores mínimo e máximo
  const min = Math.min(...dadosGrafico);
  const max = Math.max(...dadosGrafico);
  const range = max - min;
  
  // Criar SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("preserveAspectRatio", "none");
  
  // Criar caminho
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  
  // Gerar dados do caminho
  let d = `M 0 ${100 - ((dadosGrafico[0] - min) / range * 100)}`;
  
  for (let i = 1; i < dadosGrafico.length; i++) {
    const x = i / (dadosGrafico.length - 1) * 100;
    const y = 100 - ((dadosGrafico[i] - min) / range * 100);
    d += ` L ${x} ${y}`;
  }
  
  path.setAttribute("d", d);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "#00ff88");
  path.setAttribute("stroke-width", "2");
  
  svg.appendChild(path);
  container.appendChild(svg);
}

function atualizarGrafico(analise) {
  // Ajustar tendência do gráfico com base na análise
  const tendenciaFator = analise.tendencia === "ALTA" ? 0.6 : -0.6;
  const volatilidadeFator = analise.volatilidade === "ALTA" ? 3 : 
                           analise.volatilidade === "MÉDIA" ? 2 : 1;
  
  // Modificar simulação
  clearInterval(intervaloDaSimulacao);
  
  intervaloDaSimulacao = setInterval(() => {
    const ultimoPonto = dadosGrafico[dadosGrafico.length - 1];
    // Adicionar tendência e volatilidade à simulação
    const novoPonto = ultimoPonto + tendenciaFator + (Math.random() * volatilidadeFator * 2 - volatilidadeFator);
    dadosGrafico.push(novoPonto);
    
    if (dadosGrafico.length > 50) {
      dadosGrafico.shift();
    }
    
    desenharGrafico();
  }, 1000);
}

// Funções utilitárias
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

function seededRandom(seed) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}
