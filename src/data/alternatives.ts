import orangePiImg from '../assets/images/orange_pi_5_plus_1793723070308.jpg';
import radxaImg from '../assets/images/radxa_rock_5b_1793723086608.jpg';
import bananaPiImg from '../assets/images/banana_pi_bpi_m5_1793723947984.jpg';
import jetsonImg from '../assets/images/nvidia_jetson_orin_nano_1793723932623.jpg';
import khadasImg from '../assets/images/khadas_vim4_board_1793723930984.jpg';
import odroidImg from '../assets/images/odroid_n2_plus_1793723933361.jpg';
import milkvImg from '../assets/images/milkv_mars_riscv_1793723932136.jpg';

export interface AlternativeBoard {
  id: string;
  name: string;
  brand: string;
  badge: string;
  badgeColor: string;
  image: string;
  soc: string;
  cpu: string;
  npu: string;
  maxRam: string;
  storage: string;
  networking: string;
  displayOut: string;
  priceRange: string;
  summary: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  communityRating: number; // 1-5
  hardwarePowerRating: number; // 1-5
}

export const ALTERNATIVE_BOARDS: AlternativeBoard[] = [
  {
    id: 'nvidiajetson',
    name: 'NVIDIA Jetson Orin Nano',
    brand: 'NVIDIA',
    badge: 'Campeão Supremo de IA / 40 TOPS',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    image: jetsonImg,
    soc: 'NVIDIA Orin SoC (8nm)',
    cpu: '6-core Arm Cortex-A78AE v8.2 (64-bit) @ 1.5 GHz',
    npu: 'Até 40 TOPS de computação de IA (1024 CUDA Ampere + 32 Tensor Cores)',
    maxRam: '4GB ou 8GB LPDDR5 128-bit (68 GB/s de largura de banda)',
    storage: 'Dual M.2 Key M PCIe NVMe Gen 4 x4 + Slot MicroSD',
    networking: 'Gigabit Ethernet nativo + M.2 Key E para Wi-Fi/BT',
    displayOut: 'DisplayPort 1.4a (até 4K @ 60Hz com suporte a múltiplos fluxos)',
    priceRange: '$199 - $499',
    summary: 'A plataforma definitiva para Inteligência Artificial de borda e robótica. Com arquitetura NVIDIA Ampere e suporte nativo ao ecossistema CUDA, TensorRT e ROS 2, executa redes neurais e visão computacional em tempo real que nenhuma outra SBC consegue.',
    pros: [
      'Até 40 TOPS de processamento com arquitetura NVIDIA Ampere e Tensor Cores',
      'Suporte direto a bibliotecas CUDA, PyTorch acelerado e DeepStream',
      'Dois slots M.2 NVMe Gen 4 de altíssima velocidade para dados e modelos LLM',
      'Construção e suporte corporativo com padrão automotivo/industrial'
    ],
    cons: [
      'Preço significativamente mais alto que placas de uso hobby',
      'Exige fonte de alimentação de 9V a 20V DC (conector barril 19V)'
    ],
    bestFor: 'Robôs móveis autônomos (AMR), drones com detecção de obstáculos por IA, inspeção visual industrial e modelos de linguagem locais.',
    communityRating: 4.8,
    hardwarePowerRating: 5.0
  },
  {
    id: 'orangepi5plus',
    name: 'Orange Pi 5 Plus',
    brand: 'Xunlong / Orange Pi',
    badge: 'Monstro de Desempenho / 8K & Dual 2.5G',
    badgeColor: 'border-orange-500/40 text-orange-400 bg-orange-500/10',
    image: orangePiImg,
    soc: 'Rockchip RK3588 (8nm LP)',
    cpu: 'Octa-core (4x Cortex-A76 @ 2.4GHz + 4x Cortex-A55 @ 1.8GHz)',
    npu: '6 TOPS NPU integrada com aceleração INT4/INT8/INT16/FP16',
    maxRam: 'Até 32GB LPDDR4/4X',
    storage: 'M.2 M-Key NVMe 2280 nativo (PCIe 3.0 x4 de altíssima velocidade) + eMMC + MicroSD',
    networking: 'Dual 2.5 GbE Ethernet (2 portas RJ45 Realtek RTL8125BG) + Slot M.2 E-Key para Wi-Fi 6',
    displayOut: '2x HDMI 2.1 (até 8K @ 60Hz ou 4K @ 120Hz) + 1x HDMI IN (captura de vídeo 4K)',
    priceRange: '$120 - $180',
    summary: 'A principal alternativa de alto escalão ao Raspberry Pi 5. Com processador octa-core RK3588, suporte a 32GB de RAM e 2 portas de rede 2.5GbE, supera o Pi 5 em multithreading pesado e tarefas de Machine Learning.',
    pros: [
      'NPU de 6 TOPS integrada para modelos de visão computacional e IA local',
      'Duas portas Ethernet de 2.5 Gigabit nativas (ideal para roteadores e firewall)',
      'Slot M.2 2280 NVMe completo sem necessidade de placas HAT extras',
      'Entrada de captura HDMI IN para transmissão de tela ou gravador de vídeo'
    ],
    cons: [
      'Comunidade menor de suporte a bibliotecas de software comparado ao Raspberry Pi OS',
      'Consumo elétrico superior sob estresse contínuo',
      'Preço mais elevado'
    ],
    bestFor: 'Servidores de IA local, estações de emulação pesada (PS2, Switch, Gamecube), roteadores pfSense/OpenWrt de 2.5G e NVR de câmeras com reconhecimento facial.',
    communityRating: 4.2,
    hardwarePowerRating: 4.8
  },
  {
    id: 'radxarock5b',
    name: 'Radxa Rock 5B',
    brand: 'Radxa',
    badge: 'Grau Industrial / Expansão M.2 & 8K',
    badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
    image: radxaImg,
    soc: 'Rockchip RK3588 (8nm)',
    cpu: 'Octa-core (4x Cortex-A76 @ 2.4GHz + 4x Cortex-A55 @ 1.8GHz)',
    npu: '6 TOPS NPU dedicada',
    maxRam: 'Até 24GB ou 32GB LPDDR4x',
    storage: 'Slot M.2 2280 PCIe 3.0 x4 no verso + Módulo eMMC removível de alta durabilidade',
    networking: '1x 2.5 GbE Ethernet com suporte a PoE + Slot M.2 E-Key',
    displayOut: 'Dual HDMI 2.1 (8K) + 1x DisplayPort via USB-C (8K) + 1x HDMI IN',
    priceRange: '$130 - $200',
    summary: 'Projetada para aplicações industriais e quiosques digitais de alta confiabilidade. Permite conectar monitores 8K simultâneos e possui arquitetura de alimentação robusta.',
    pros: [
      'Suporte a múltiplos monitores 8K simultâneos com aceleração de hardware',
      'Excelente dissipação de calor e componentes com ciclo de vida industrial',
      'Slot M.2 integrado no lado de baixo da PCB para perfil plano',
      'Suporte a sistemas Debian, Ubuntu, Armbian e Android 12'
    ],
    cons: [
      'Documentação técnica mais fragmentada para iniciantes',
      'Acessórios proprietários mais caros no mercado internacional'
    ],
    bestFor: 'Sinalização digital 8K, computação de borda industrial, robótica pesada e servidores Kubernetes ARM.',
    communityRating: 4.0,
    hardwarePowerRating: 4.7
  },
  {
    id: 'khadasvim4',
    name: 'Khadas VIM4',
    brand: 'Khadas',
    badge: 'SBC Premium com OOWOW Cloud Installer',
    badgeColor: 'border-pink-500/40 text-pink-400 bg-pink-500/10',
    image: khadasImg,
    soc: 'Amlogic A311D2 (12nm)',
    cpu: 'Octa-core (4x Cortex-A73 @ 2.2GHz + 4x Cortex-A53 @ 2.0GHz)',
    npu: '3.2 TOPS NPU para redes convolucionais e detecção de poses',
    maxRam: '8GB LPDDR4X-4266',
    storage: '32GB eMMC 5.1 onboard de alta velocidade + MicroSD',
    networking: 'Gigabit Ethernet, Wi-Fi 6 (802.11ax 2x2 MIMO) e Bluetooth 5.2',
    displayOut: 'Micro-HDMI 2.1 (4K @ 60Hz com HDR10+) + USB-C com DisplayPort',
    priceRange: '$190 - $220',
    summary: 'A placa mais luxuosa e bem acabada do mercado maker. Inclui o recurso inovador OOWOW: um sistema de inicialização em nuvem gravado em chip SPI que permite instalar qualquer SO Linux pela rede sem precisar de computador ou cartão SD.',
    pros: [
      'Instalador de sistemas OOWOW embarcado que baixa e grava SOs diretamente',
      'Conexão Wi-Fi 6 ultrarrápida integrada com antenas duplas',
      'Sensor giroscópio de 3 eixos e microfones digitais duplos na placa',
      'Refrigeração ativa compacta sob medida de alumínio silencioso'
    ],
    cons: [
      'Custo por unidade elevado',
      'Ecossistema mais proprietário de acessórios Khadas'
    ],
    bestFor: 'Projetos portáteis com IA, videoconferência inteligente, centrais de mídia 4K HDR e desenvolvimento avançado de Android/Linux.',
    communityRating: 4.4,
    hardwarePowerRating: 4.4
  },
  {
    id: 'odroidn2plus',
    name: 'Hardkernel ODROID-N2+',
    brand: 'Hardkernel',
    badge: 'Rei do Home Assistant & Emulação',
    badgeColor: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    image: odroidImg,
    soc: 'Amlogic S922X (12nm)',
    cpu: 'Hexa-core (4x Cortex-A73 @ 2.4GHz + 2x Cortex-A53 @ 2.0GHz)',
    npu: 'Nenhum dedicado',
    maxRam: '4GB DDR4-2640',
    storage: 'Soquete eMMC de alta durabilidade + Slot MicroSD UHS-1',
    networking: 'Gigabit Ethernet nativo (até 940 Mbps)',
    displayOut: '1x HDMI 2.0 (4K @ 60Hz com CEC e HDR)',
    priceRange: '$85 - $110',
    summary: 'Uma das placas mais estáveis e respeitadas de todos os tempos. Construída sobre um bloco maciço de alumínio anodizado preto que serve de dissipador térmico passivo sem ventoinha. É a plataforma padrão recomendada pelos desenvolvedores do Home Assistant Blue.',
    pros: [
      'Dissipação 100% passiva e silenciosa capaz de sustentar 2.4GHz sem throttling',
      'Excelente compatibilidade com Home Assistant OS, CoreELEC e Batocera',
      'Desempenho de CPU single-thread superior para emulação fluida de Dreamcast e PSP',
      'Barramento USB 3.0 com 4 portas de alta largura de banda'
    ],
    cons: [
      'Formato maior e mais pesado devido ao dissipador maciço de alumínio',
      'Sem Wi-Fi nativo soldado (exige dongle USB ou placa adaptadora)'
    ],
    bestFor: 'Centrais de automação residencial Home Assistant 24/7, estações de retrogaming com CoreELEC/Batocera e reprodutores 4K HDR.',
    communityRating: 4.7,
    hardwarePowerRating: 4.1
  },
  {
    id: 'bananapim5',
    name: 'Banana Pi BPI-M5 / BPI-R3',
    brand: 'SinoVoip / Banana Pi',
    badge: 'Especialista em Redes & NAS com eMMC',
    badgeColor: 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10',
    image: bananaPiImg,
    soc: 'Amlogic S905X3 Quad-core @ 2.0GHz',
    cpu: 'Quad-core Arm Cortex-A55 @ 2.0 GHz',
    npu: '1.2 TOPS (versões compatíveis)',
    maxRam: '4GB LPDDR4',
    storage: '16GB de memória flash eMMC soldada de fábrica + Slot MicroSD',
    networking: 'Gigabit Ethernet nativo / 2x portas SFP+ na versão de roteador R3',
    displayOut: '1x HDMI 2.1 (4K @ 60Hz com HDR)',
    priceRange: '$60 - $95',
    summary: 'A linha Banana Pi se destaca por trazer memória flash eMMC já soldada na placa (dispensando cartão SD para o sistema) e modelos especializados em roteamento com portas de fibra SFP+.',
    pros: [
      'Memória flash eMMC integrada de fábrica para boot ultra rápido e durável',
      'Total compatibilidade física com os 40 pinos GPIO do Raspberry Pi',
      'Excelente desempenho térmico com baixo aquecimento sob uso contínuo'
    ],
    cons: [
      'Desempenho gráfico inferior para renderização 3D avançada',
      'Menos projetos e tutoriais práticos na comunidade brasileira'
    ],
    bestFor: 'Servidores DNS Pi-hole, firewall residencial com OpenWrt, centrais de mídia Kodi e automação comercial simples.',
    communityRating: 3.8,
    hardwarePowerRating: 3.7
  },
  {
    id: 'milkvmars',
    name: 'Milk-V Mars (RISC-V)',
    brand: 'Milk-V',
    badge: 'Arquitetura Aberta RISC-V no Padrão Pi',
    badgeColor: 'border-red-500/40 text-red-400 bg-red-500/10',
    image: milkvImg,
    soc: 'StarFive JH7110 (28nm)',
    cpu: 'Quad-core RISC-V 64-bit (SiFive U74) @ 1.5 GHz',
    npu: 'Não aplicável (Foco em computação geral e pesquisa)',
    maxRam: 'Até 8GB LPDDR4',
    storage: 'Slot MicroSD + Soquete para módulo eMMC + Flash SPI NOR',
    networking: 'Gigabit Ethernet com suporte a PoE + Slot M.2 E-Key para Wi-Fi 6',
    displayOut: '1x HDMI 2.0 (4K @ 30Hz) + Interface MIPI DSI para display',
    priceRange: '$40 - $70',
    summary: 'A primeira placa RISC-V projetada exatamente no mesmo tamanho mecânico do Raspberry Pi 3/4. Permite que entusiastas e desenvolvedores executem distribuições Linux completas (Debian, Fedora, Ubuntu) sobre uma arquitetura livre e aberta sem pagar royalties à ARM.',
    pros: [
      'Totalmente baseada em conjunto de instruções aberto e livre RISC-V',
      'Fator de forma idêntico ao Raspberry Pi 4 (encaixa em cases e suportes padrão)',
      'Preço extremamente acessível para uma placa RISC-V quad-core com GPU',
      'Suporte a decodificação de vídeo H.264/H.265 em hardware'
    ],
    cons: [
      'Muitos pacotes de software ainda estão sendo portados para arquitetura RISC-V',
      'Desempenho de CPU modesto comparado a chips Cortex-A76 modernos'
    ],
    bestFor: 'Estudantes e pesquisadores de arquitetura de computadores, desenvolvedores de compiladores e apoiadores de hardware de código aberto.',
    communityRating: 4.1,
    hardwarePowerRating: 3.5
  }
];
