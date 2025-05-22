// Integração do analisador OTC com o site Robin Hood OTC
// Foco em análise de timeframe M1 com detecção de padrões e indicadores

// Configurações globais
const config = {
  timeframes: {
    primary: "M1",
    alternatives: ["M5", "M15", "M30"]
  },
  indicators: {
    rsi: {
      periods: 14,
      overbought: 70,
      oversold: 30
    },
    macd: {
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9
    },
    bollinger: {
      periods: 20,
      standardDeviations: 2
    },
    movingAverages: {
      short: 5,
      medium: 10,
      long: 20
    }
  },
  patterns: {
    candles: ["doji", "hammer", "engulfing", "morningstar", "eveningstar", "shootingstar"],
    trends: ["support", "resistance", "channel", "triangle", "wedge"],
    signals: ["divergence", "crossover", "breakout"]
  },
  analysis: {
    updateInterval: 1000, // ms
    historyLength: 60,    // candles to analyze for M1
    confidenceThreshold: 0.7
  }
};

// Classe principal para análise de gráficos OTC
class OTCAnalyzer {
  constructor() {
    this.config = config;
    this.currentPair = null;
    this.currentTimeframe = config.timeframes.primary;
    this.captureMode = "manual"; // "manual" ou "auto"
    this.analysisResults = null;
    this.chartData = [];
    this.isAnalyzing = false;
    this.captureInterval = null;
    
    // Elementos DOM (serão inicializados após o carregamento da página)
    this.elements = {
      pairSelector: null,
      timeframeSelector: null,
      captureButton: null,
      autoModeToggle: null,
      resultContainer: null,
      signalDisplay: null,
      patternsList: null,
      indicatorsDisplay: null,
      chartContainer: null,
      historyContainer: null
    };
    
    // Inicializar quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', () => this.initialize());
  }
  
  // Inicializa o analisador
  initialize() {
    console.log("Inicializando OTC Analyzer...");
    this.bindDOMElements();
    this.setupEventListeners();
    this.setupChartContainer();
    this.updateUIState();
  }
  
  // Vincula elementos DOM
  bindDOMElements() {
    this.elements.pairSelector = document.getElementById('currency-pair');
    this.elements.timeframeSelector = document.getElementById('timeframe-selector');
    this.elements.captureButton = document.getElementById('capture-button');
    this.elements.autoModeToggle = document.getElementById('auto-mode-toggle');
    this.elements.resultContainer = document.getElementById('analysis-results');
    this.elements.signalDisplay = document.getElementById('sinal');
    this.elements.patternsList = document.getElementById('patterns-list');
    this.elements.indicatorsDisplay = document.getElementById('indicators-display');
    this.elements.chartContainer = document.getElementById('chart-simulation');
    this.elements.historyContainer = document.getElementById('analysis-history');
  }
  
  // Configura event listeners
  setupEventListeners() {
    // Mudança de par de moedas
    this.elements.pairSelector.addEventListener('change', () => {
      this.currentPair = this.elements.pairSelector.value;
      this.resetAnalysis();
      if (this.captureMode === "auto") {
        this.startAutoCapture();
      }
    });
    
    // Mudança de timeframe
    this.elements.timeframeSelector.addEventListener('change', () => {
      this.currentTimeframe = this.elements.timeframeSelector.value;
      this.resetAnalysis();
      if (this.captureMode === "auto") {
        this.startAutoCapture();
      }
    });
    
    // Botão de captura manual
    this.elements.captureButton.addEventListener('click', () => {
      this.captureAndAnalyze();
    });
    
    // Toggle de modo automático
    this.elements.autoModeToggle.addEventListener('change', (e) => {
      this.captureMode = e.target.checked ? "auto" : "manual";
      if (this.captureMode === "auto") {
        this.startAutoCapture();
      } else {
        this.stopAutoCapture();
      }
      this.updateUIState();
    });
  }
  
  // Configura o container do gráfico
  setupChartContainer() {
    // Inicializa o gráfico vazio
    this.drawChart([]);
  }
  
  // Atualiza o estado da UI com base no modo atual
  updateUIState() {
    // Atualiza visibilidade/estado dos botões com base no modo
    this.elements.captureButton.disabled = (this.captureMode === "auto");
    
    // Atualiza outros elementos da UI conforme necessário
    if (this.currentPair) {
      document.getElementById('market-trend').textContent = `Tendência: Analisando ${this.currentPair}...`;
      document.getElementById('market-volatility').textContent = `Volatilidade: Analisando...`;
    }
  }
  
  // Inicia captura automática
  startAutoCapture() {
    this.stopAutoCapture(); // Para qualquer captura existente
    
    // Define intervalo com base no timeframe
    const intervalTime = this.currentTimeframe === "M1" ? 1000 : 5000;
    
    this.captureInterval = setInterval(() => {
      this.captureAndAnalyze();
    }, intervalTime);
    
    console.log(`Iniciando captura automática a cada ${intervalTime}ms`);
  }
  
  // Para captura automática
  stopAutoCapture() {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
      console.log("Captura automática interrompida");
    }
  }
  
  // Captura e analisa o gráfico atual
  captureAndAnalyze() {
    if (this.isAnalyzing) return;
    
    this.isAnalyzing = true;
    console.log(`Capturando e analisando ${this.currentPair} em ${this.currentTimeframe}`);
    
    // Em um cenário real, aqui capturaria a tela ou receberia upload
    // Para o protótipo, vamos simular dados
    this.simulateCapture()
      .then(chartData => {
        this.chartData = chartData;
        return this.analyzeChart(chartData);
      })
      .then(results => {
        this.analysisResults = results;
        this.updateUI(results);
        this.addToHistory(results);
        this.isAnalyzing = false;
      })
      .catch(error => {
        console.error("Erro na análise:", error);
        this.isAnalyzing = false;
      });
  }
  
  // Simula captura de dados do gráfico (para protótipo)
  simulateCapture() {
    return new Promise(resolve => {
      // Simula dados de velas para o par e timeframe atual
      const candles = [];
      const basePrice = this.getBasePrice(this.currentPair);
      const volatility = this.getVolatility(this.currentPair);
      
      // Gera histórico de velas
      let lastClose = basePrice;
      for (let i = 0; i < config.analysis.historyLength; i++) {
        const open = lastClose;
        const high = open + (Math.random() * volatility);
        const low = open - (Math.random() * volatility);
        const close = low + (Math.random() * (high - low));
        
        candles.push({
          time: Date.now() - ((config.analysis.historyLength - i) * 60000),
          open,
          high,
          close,
          low,
          volume: Math.random() * 100
        });
        
        lastClose = close;
      }
      
      setTimeout(() => {
        resolve(candles);
      }, 500); // Simula tempo de processamento
    });
  }
  
  // Obtém preço base para simulação com base no par
  getBasePrice(pair) {
    const prices = {
      "EUR/USD": 1.1,
      "GBP/USD": 1.3,
      "USD/JPY": 110,
      "AUD/USD": 0.75,
      "USD/CAD": 1.25,
      "USD/CHF": 0.9,
      "NZD/USD": 0.7
    };
    
    return prices[pair] || 1.0;
  }
  
  // Obtém volatilidade para simulação com base no par
  getVolatility(pair) {
    const volatility = {
      "EUR/USD": 0.0005,
      "GBP/USD": 0.001,
      "USD/JPY": 0.05,
      "AUD/USD": 0.0008,
      "USD/CAD": 0.0007,
      "USD/CHF": 0.0006,
      "NZD/USD": 0.0009
    };
    
    return volatility[pair] || 0.001;
  }
  
  // Analisa os dados do gráfico
  analyzeChart(chartData) {
    return new Promise(resolve => {
      // Aqui seria implementada a análise real
      // Para o protótipo, vamos simular resultados
      
      // Calcula tendência com base nos últimos preços
      const prices = chartData.map(c => c.close);
      const trend = this.calculateTrend(prices);
      
      // Simula detecção de padrões
      const patterns = this.detectPatterns(chartData);
      
      // Calcula indicadores
      const indicators = this.calculateIndicators(chartData);
      
      // Determina sinal com base na análise
      const signal = this.determineSignal(trend, patterns, indicators);
      
      // Gera justificativa
      const justification = this.generateJustification(signal, trend, patterns, indicators);
      
      // Prepara resultado
      const result = {
        pair: this.currentPair,
        timeframe: this.currentTimeframe,
        timestamp: new Date().toLocaleTimeString(),
        trend,
        patterns,
        indicators,
        signal,
        justification
      };
      
      setTimeout(() => {
        resolve(result);
      }, 500); // Simula tempo de processamento
    });
  }
  
  // Calcula tendência com base nos preços
  calculateTrend(prices) {
    // Calcula média móvel simples
    const shortMA = this.calculateSMA(prices, config.indicators.movingAverages.short);
    const mediumMA = this.calculateSMA(prices, config.indicators.movingAverages.medium);
    const longMA = this.calculateSMA(prices, config.indicators.movingAverages.long);
    
    // Determina direção da tendência
    let direction = "LATERAL";
    let strength = "FRACA";
    
    if (shortMA > mediumMA && mediumMA > longMA) {
      direction = "ALTA";
      strength = shortMA - longMA > prices[prices.length-1] * 0.005 ? "FORTE" : "MODERADA";
    } else if (shortMA < mediumMA && mediumMA < longMA) {
      direction = "BAIXA";
      strength = longMA - shortMA > prices[prices.length-1] * 0.005 ? "FORTE" : "MODERADA";
    }
    
    // Calcula volatilidade
    const volatility = this.calculateVolatility(prices);
    let volatilityLevel = "MÉDIA";
    
    if (volatility < 0.0003) {
      volatilityLevel = "BAIXA";
    } else if (volatility > 0.0008) {
      volatilityLevel = "ALTA";
    }
    
    return {
      direction,
      strength,
      volatility: volatilityLevel
    };
  }
  
  // Calcula média móvel simples
  calculateSMA(prices, periods) {
    if (prices.length < periods) {
      return prices[prices.length - 1];
    }
    
    const slice = prices.slice(prices.length - periods);
    const sum = slice.reduce((total, price) => total + price, 0);
    return sum / periods;
  }
  
  // Calcula volatilidade
  calculateVolatility(prices) {
    if (prices.length < 2) return 0;
    
    let sum = 0;
    for (let i = 1; i < prices.length; i++) {
      const change = Math.abs(prices[i] - prices[i-1]) / prices[i-1];
      sum += change;
    }
    
    return sum / (prices.length - 1);
  }
  
  // Detecta padrões nos dados do gráfico
  detectPatterns(chartData) {
    const detectedPatterns = [];
    
    // Simplificação para o protótipo
    // Em uma implementação real, usaríamos algoritmos mais sofisticados
    
    // Verifica padrões de velas
    const lastCandles = chartData.slice(-5);
    
    // Doji
    const lastCandle = lastCandles[lastCandles.length - 1];
    if (Math.abs(lastCandle.open - lastCandle.close) < 0.1 * (lastCandle.high - lastCandle.low)) {
      detectedPatterns.push("Doji");
    }
    
    // Hammer
    if (lastCandle.close > lastCandle.open && 
        (lastCandle.high - lastCandle.close) < 0.3 * (lastCandle.close - lastCandle.low)) {
      detectedPatterns.push("Martelo");
    }
    
    // Engulfing
    if (lastCandles.length >= 2) {
      const prevCandle = lastCandles[lastCandles.length - 2];
      if (prevCandle.close < prevCandle.open && // Vela anterior vermelha
          lastCandle.close > lastCandle.open && // Vela atual verde
          lastCandle.open < prevCandle.close && 
          lastCandle.close > prevCandle.open) {
        detectedPatterns.push("Engolfo de Alta");
      } else if (prevCandle.close > prevCandle.open && // Vela anterior verde
                lastCandle.close < lastCandle.open && // Vela atual vermelha
                lastCandle.open > prevCandle.close && 
                lastCandle.close < prevCandle.open) {
        detectedPatterns.push("Engolfo de Baixa");
      }
    }
    
    // Simula outros padrões aleatoriamente para o protótipo
    const possiblePatterns = [
      "Suporte", "Resistência", "Cruzamento de Médias", 
      "Divergência RSI", "Triângulo Ascendente", "Bandeira de Alta"
    ];
    
    // Adiciona 0-2 padrões aleatórios para demonstração
    const randomCount = Math.floor(Math.random() * 3);
    for (let i = 0; i < randomCount; i++) {
      const pattern = possiblePatterns[Math.floor(Math.random() * possiblePatterns.length)];
      if (!detectedPatterns.includes(pattern)) {
        detectedPatterns.push(pattern);
      }
    }
    
    return detectedPatterns;
  }
  
  // Calcula indicadores técnicos
  calculateIndicators(chartData) {
    const prices = chartData.map(c => c.close);
    
    // RSI
    const rsi = this.calculateRSI(prices, config.indicators.rsi.periods);
    
    // MACD
    const macd = this.calculateMACD(
      prices, 
      config.indicators.macd.fastPeriod,
      config.indicators.macd.slowPeriod,
      config.indicators.macd.signalPeriod
    );
    
    // Bandas de Bollinger
    const bollinger = this.calculateBollinger(
      prices,
      config.indicators.bollinger.periods,
      config.indicators.bollinger.standardDeviations
    );
    
    return {
      rsi,
      macd,
      bollinger
    };
  }
  
  // Calcula RSI
  calculateRSI(prices, periods) {
    if (prices.length < periods + 1) {
      return 50; // Valor neutro
    }
    
    let gains = 0;
    let losses = 0;
    
    for (let i = prices.length - periods; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change >= 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }
    
    if (losses === 0) return 100;
    
    const relativeStrength = gains / losses;
    const rsi = 100 - (100 / (1 + relativeStrength));
    
    return Math.round(rsi * 100) / 100;
  }
  
  // Calcula MACD
  calculateMACD(prices, fastPeriod, slowPeriod, signalPeriod) {
    if (prices.length < slowPeriod) {
      return { line: 0, signal: 0, histogram: 0 };
    }
    
    // EMA rápida
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    
    // EMA lenta
    const slowEMA = this.calculateEMA(prices, slowPeriod);
    
    // Linha MACD
    const macdLine = fastEMA - slowEMA;
    
    // Linha de sinal (EMA da linha MACD)
    const macdValues = [];
    for (let i = 0; i < prices.length; i++) {
      const fastEMA = this.calculateEMA(prices.slice(0, i + 1), fastPeriod);
      const slowEMA = this.calculateEMA(prices.slice(0, i + 1), slowPeriod);
      macdValues.push(fastEMA - slowEMA);
    }
    
    const signalLine = this.calculateEMA(macdValues, signalPeriod);
    
    // Histograma
    const histogram = macdLine - signalLine;
    
    return {
      line: Math.round(macdLine * 10000) / 10000,
      signal: Math.round(signalLine * 10000) / 10000,
      histogram: Math.round(histogram * 10000) / 10000
    };
  }
  
  // Calcula EMA
  calculateEMA(prices, periods) {
    if (prices.length < periods) {
      return prices[prices.length - 1];
    }
    
    const k = 2 / (periods + 1);
    
    // Começa com SMA
    let ema = this.calculateSMA(prices.slice(0, periods), periods);
    
    // Calcula EMA
    for (let i = periods; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
    }
    
    return ema;
  }
  
  // Calcula Bandas de Bollinger
  calculateBollinger(prices, periods, standardDeviations) {
    if (prices.length < periods) {
      const price = prices[prices.length - 1];
      return { upper: price * 1.01, middle: price, lower: price * 0.99 };
    }
    
    // Média móvel
    const middle = this.calculateSMA(prices, periods);
    
    // Desvio padrão
    const slice = prices.slice(prices.length - periods);
    let sum = 0;
    for (let i = 0; i < slice.length; i++) {
      sum += Math.pow(slice[i] - middle, 2);
    }
    const stdDev = Math.sqrt(sum / periods);
    
    // Bandas
    const upper = middle + (standardDeviations * stdDev);
    const lower = middle - (standardDeviations * stdDev);
    
    return {
      upper: Math.round(upper * 10000) / 10000,
      middle: Math.round(middle * 10000) / 10000,
      lower: Math.round(lower * 10000) / 10000
    };
  }
  
  // Determina sinal com base na análise
  determineSignal(trend, patterns, indicators) {
    // Pontuação para cada direção
    let bullishScore = 0;
    let bearishScore = 0;
    
    // Avalia tendência
    if (trend.direction === "ALTA") {
      bullishScore += trend.strength === "FORTE" ? 2 : 1;
    } else if (trend.direction === "BAIXA") {
      bearishScore += trend.strength === "FORTE" ? 2 : 1;
    }
    
    // Avalia padrões
    const bullishPatterns = ["Martelo", "Engolfo de Alta", "Suporte", "Cruzamento de Médias", "Triângulo Ascendente", "Bandeira de Alta"];
    const bearishPatterns = ["Engolfo de Baixa", "Resistência", "Divergência RSI"];
    
    patterns.forEach(pattern => {
      if (bullishPatterns.includes(pattern)) bullishScore += 1;
      if (bearishPatterns.includes(pattern)) bearishScore += 1;
    });
    
    // Avalia indicadores
    // RSI
    if (indicators.rsi < 30) bullishScore += 1; // Sobrevendido
    if (indicators.rsi > 70) bearishScore += 1; // Sobrecomprado
    
    // MACD
    if (indicators.macd.histogram > 0 && indicators.macd.histogram > indicators.macd.histogram * 0.1) {
      bullishScore += 1;
    } else if (indicators.macd.histogram < 0 && indicators.macd.histogram < indicators.macd.histogram * 0.1) {
      bearishScore += 1;
    }
    
    // Bandas de Bollinger
    const lastPrice = this.chartData[this.chartData.length - 1].close;
    if (lastPrice < indicators.bollinger.lower) bullishScore += 1;
    if (lastPrice > indicators.bollinger.upper) bearishScore += 1;
    
    // Determina sinal com base nas pontuações
    if (bullishScore > bearishScore && bullishScore >= 3) {
      return "CALL";
    } else if (bearishScore > bullishScore && bearishScore >= 3) {
      return "PUT";
    } else {
      return "AGUARDE";
    }
  }
  
  // Gera justificativa para o sinal
  generateJustification(signal, trend, patterns, indicators) {
    let justification = "";
    
    if (signal === "CALL") {
      justification = `Recomendação de CALL baseada na tendência de ${trend.direction} ${trend.strength.toLowerCase()}`;
      
      if (patterns.length > 0) {
        justification += ` e nos padrões ${patterns.join(", ")}`;
      }
      
      if (indicators.rsi < 30) {
        justification += `. O RSI em ${indicators.rsi} indica condição de sobrevendido`;
      }
      
      if (indicators.macd.histogram > 0) {
        justification += `. O MACD mostra momentum positivo`;
      }
      
      justification += `. A volatilidade ${trend.volatility.toLowerCase()} sugere momento favorável para entrada.`;
    } else if (signal === "PUT") {
      justification = `Recomendação de PUT baseada na tendência de ${trend.direction} ${trend.strength.toLowerCase()}`;
      
      if (patterns.length > 0) {
        justification += ` e nos padrões ${patterns.join(", ")}`;
      }
      
      if (indicators.rsi > 70) {
        justification += `. O RSI em ${indicators.rsi} indica condição de sobrecomprado`;
      }
      
      if (indicators.macd.histogram < 0) {
        justification += `. O MACD mostra momentum negativo`;
      }
      
      justification += `. A volatilidade ${trend.volatility.toLowerCase()} indica potencial de queda.`;
    } else {
      justification = `Recomendação de AGUARDE devido a sinais mistos. Tendência de ${trend.direction} com volatilidade ${trend.volatility.toLowerCase()}`;
      
      if (patterns.length > 0) {
        justification += `, mas os padrões ${patterns.join(", ")} não indicam momento ideal para entrada`;
      } else {
        justification += `. Nenhum padrão claro foi identificado`;
      }
      
      justification += `. RSI em ${indicators.rsi} está em zona neutra.`;
    }
    
    return justification;
  }
  
  // Atualiza a UI com os resultados da análise
  updateUI(results) {
    if (!results) return;
    
    // Atualiza tendência e volatilidade
    document.getElementById('market-trend').textContent = `Tendência: ${results.trend.direction} ${results.trend.strength}`;
    document.getElementById('market-volatility').textContent = `Volatilidade: ${results.trend.volatility}`;
    
    // Atualiza padrões identificados
    this.elements.patternsList.innerHTML = results.patterns.length > 0 
      ? results.patterns.map(pattern => `<li>${pattern}</li>`).join('')
      : '<li>Nenhum padrão identificado</li>';
    
    // Atualiza sinal e justificativa
    const sinalElement = this.elements.signalDisplay;
    sinalElement.innerText = `SINAL: ${results.signal}`;
    sinalElement.className = '';
    
    if (results.signal === "CALL") {
      sinalElement.classList.add('call');
    } else if (results.signal === "PUT") {
      sinalElement.classList.add('put');
    } else {
      sinalElement.classList.add('wait');
    }
    
    document.getElementById('signal-reason').innerText = results.justification;
    
    // Atualiza indicadores
    this.updateIndicatorsDisplay(results.indicators);
    
    // Atualiza gráfico
    this.drawChart(this.chartData);
  }
  
  // Atualiza display de indicadores
  updateIndicatorsDisplay(indicators) {
    if (!this.elements.indicatorsDisplay) return;
    
    let html = `
      <div class="indicator">
        <span class="indicator-name">RSI (14):</span>
        <span class="indicator-value ${indicators.rsi < 30 ? 'oversold' : indicators.rsi > 70 ? 'overbought' : 'neutral'}">
          ${indicators.rsi}
        </span>
      </div>
      <div class="indicator">
        <span class="indicator-name">MACD:</span>
        <span class="indicator-value ${indicators.macd.histogram > 0 ? 'positive' : 'negative'}">
          ${indicators.macd.line} (Sinal: ${indicators.macd.signal})
        </span>
      </div>
      <div class="indicator">
        <span class="indicator-name">Bandas de Bollinger:</span>
        <span class="indicator-value">
          Superior: ${indicators.bollinger.upper} | Média: ${indicators.bollinger.middle} | Inferior: ${indicators.bollinger.lower}
        </span>
      </div>
    `;
    
    this.elements.indicatorsDisplay.innerHTML = html;
  }
  
  // Desenha o gráfico
  drawChart(chartData) {
    if (!this.elements.chartContainer) return;
    
    // Limpa o container
    this.elements.chartContainer.innerHTML = '';
    
    if (chartData.length === 0) return;
    
    // Cria SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", "0 0 100 50");
    svg.setAttribute("preserveAspectRatio", "none");
    
    // Encontra valores mínimo e máximo
    const prices = chartData.map(c => c.close);
    const min = Math.min(...prices) * 0.999;
    const max = Math.max(...prices) * 1.001;
    const range = max - min;
    
    // Cria caminho para linha de preço
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    
    // Gera dados do caminho
    let d = `M 0 ${50 - ((chartData[0].close - min) / range * 50)}`;
    
    for (let i = 1; i < chartData.length; i++) {
      const x = i / (chartData.length - 1) * 100;
      const y = 50 - ((chartData[i].close - min) / range * 50);
      d += ` L ${x} ${y}`;
    }
    
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#00ff88");
    path.setAttribute("stroke-width", "0.5");
    
    svg.appendChild(path);
    
    // Adiciona velas (simplificadas)
    for (let i = Math.max(0, chartData.length - 20); i < chartData.length; i++) {
      const candle = chartData[i];
      const x = i / (chartData.length - 1) * 100;
      const width = 100 / chartData.length * 0.8;
      
      const openY = 50 - ((candle.open - min) / range * 50);
      const closeY = 50 - ((candle.close - min) / range * 50);
      const highY = 50 - ((candle.high - min) / range * 50);
      const lowY = 50 - ((candle.low - min) / range * 50);
      
      // Corpo da vela
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x - width/2);
      rect.setAttribute("y", Math.min(openY, closeY));
      rect.setAttribute("width", width);
      rect.setAttribute("height", Math.abs(closeY - openY) || 0.1);
      rect.setAttribute("fill", closeY < openY ? "#00ff88" : "#ff4d4d");
      
      // Sombra
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x);
      line.setAttribute("y1", highY);
      line.setAttribute("x2", x);
      line.setAttribute("y2", lowY);
      line.setAttribute("stroke", closeY < openY ? "#00ff88" : "#ff4d4d");
      line.setAttribute("stroke-width", "0.2");
      
      svg.appendChild(line);
      svg.appendChild(rect);
    }
    
    this.elements.chartContainer.appendChild(svg);
  }
  
  // Adiciona resultado ao histórico
  addToHistory(result) {
    if (!result) return;
    
    const entry = document.createElement('p');
    entry.innerHTML = `${result.timestamp} - ${result.pair}: <span class="${result.signal.toLowerCase()}">${result.signal}</span>`;
    
    // Adiciona ao início do histórico
    if (this.elements.historyContainer.firstChild) {
      this.elements.historyContainer.insertBefore(entry, this.elements.historyContainer.firstChild);
    } else {
      this.elements.historyContainer.appendChild(entry);
    }
    
    // Limita o histórico a 10 entradas
    while (this.elements.historyContainer.children.length > 10) {
      this.elements.historyContainer.removeChild(this.elements.historyContainer.lastChild);
    }
  }
  
  // Reseta a análise atual
  resetAnalysis() {
    this.chartData = [];
    this.analysisResults = null;
    this.updateUI(null);
    
    // Reseta elementos visuais
    this.elements.patternsList.innerHTML = '<li>Aguardando análise...</li>';
    this.elements.signalDisplay.innerText = 'SINAL: AGUARDE';
    this.elements.signalDisplay.className = 'wait';
    document.getElementById('signal-reason').innerText = 'Aguardando análise do gráfico...';
    
    // Limpa gráfico
    this.elements.chartContainer.innerHTML = '';
  }
}

// Inicializa o analisador quando o script for carregado
const analyzer = new OTCAnalyzer();

// Função para gerar análise quando o botão é clicado
function gerarAnalise() {
  analyzer.captureAndAnalyze();
}

// Função para analisar automaticamente quando o par de moedas é alterado
function analisarAutomaticamente() {
  analyzer.captureAndAnalyze();
}
