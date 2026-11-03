// Image imports
import pi5Img from '../assets/images/raspberry_pi_5_board_1793723065529.jpg';
import pi4Img from '../assets/images/raspberry_pi_4_board_1793723065874.jpg';
import pi3bImg from '../assets/images/raspberry_pi_3b_plus_1793723085999.jpg';
import zero2wImg from '../assets/images/raspberry_pi_zero_2w_1793723067264.jpg';
import zeroWImg from '../assets/images/raspberry_pi_zero_w_1793723721081.jpg';
import picoImg from '../assets/images/raspberry_pi_pico_board_1793723068522.jpg';
import pico2Img from '../assets/images/raspberry_pi_pico2_1793723704464.jpg';
import pi400Img from '../assets/images/raspberry_pi_400_computer_1793723086949.jpg';
import cm4Img from '../assets/images/raspberry_pi_cm4_1793723703909.jpg';
import cm5Img from '../assets/images/raspberry_pi_cm5_1793723721153.jpg';
import pi3aImg from '../assets/images/raspberry_pi_3a_plus_1793723705155.jpg';
import pi1bImg from '../assets/images/raspberry_pi_1b_plus_1793723706058.jpg';

export interface BoardModel {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  category: 'sbc' | 'zero' | 'mcu' | 'keyboard' | 'compute';
  releaseDate: string;
  msrp: string;
  status: 'Ativo' | 'Legado' | 'Foco Educacional' | 'Industrial';
  image: string;
  description: string;
  soc: string;
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
  videoOut: string;
  audio: string;
  networking: string;
  usb: string;
  pcie: string;
  gpio: string;
  power: string;
  dimensions: string;
  keyFeatures: string[];
  benchmarkScore: number; // 0 - 100 relative index
}

export const BOARD_MODELS: BoardModel[] = [
  {
    id: 'pi5',
    name: 'Raspberry Pi 5',
    badge: 'Flagship Oficial / 3x Mais Rápido',
    badgeColor: 'border-pink-500/40 text-pink-400 bg-pink-500/10',
    category: 'sbc',
    releaseDate: 'Outubro de 2023',
    msrp: '$60 (4GB) / $80 (8GB) / $50 (2GB)',
    status: 'Ativo',
    image: pi5Img,
    description: 'A geração definitiva do computador de placa única mais popular do mundo. Traz até 3x mais desempenho de CPU e GPU, barramento PCIe nativo para SSDs NVMe e chip de I/O dedicado RP1.',
    soc: 'Broadcom BCM2712 (16nm FinFET)',
    cpu: 'Quad-core Arm Cortex-A76 @ 2.4 GHz (64-bit, 512KB L2 por núcleo, 2MB L3)',
    gpu: 'VideoCore VII @ 800 MHz (Vulkan 1.2, OpenGL ES 3.1)',
    ram: '2GB, 4GB ou 8GB LPDDR4X-4267 SDRAM',
    storage: 'Slot MicroSD (SDR104 modo rápido) + M.2 NVMe via conector PCIe 2.0 x1',
    videoOut: '2x Micro-HDMI (Dual 4K @ 60Hz simultâneo com HDR)',
    audio: 'Via HDMI ou DAC I2S / USB externo (sem jack P2 analógico)',
    networking: 'Gigabit Ethernet nativo, Wi-Fi 802.11ac 2.4/5GHz, Bluetooth 5.0 / BLE',
    usb: '2x USB 3.0 (5Gbps concorrentes) + 2x USB 2.0 via controlador RP1',
    pcie: 'Conector PCIe 2.0 x1 de 16 vias FFC (habilita SSD NVMe de alta velocidade)',
    gpio: 'Header padrão de 40 pinos Raspberry Pi (alimentado pelo chip RP1)',
    power: '5V / 5.0A DC via USB-C com Power Delivery (27W PD recomendado)',
    dimensions: '85 x 56 mm (Formato HAT clássico)',
    keyFeatures: [
      'Conector PCIe 2.0 x1 para boot instantâneo por SSD NVMe',
      'Controlador Southbridge proprietário RP1 para I/O mais veloz',
      'Botão físico liga/desliga integrado na placa e conector de bateria RTC',
      'Conector de 4 vias dedicado para ventoinha PWM (Active Cooler)',
      '2x conectores MIPI bidirecionais de 4 vias para Câmera ou Display'
    ],
    benchmarkScore: 98
  },
  {
    id: 'cm5',
    name: 'Raspberry Pi Compute Module 5 (CM5)',
    badge: 'Industrial Flagship / Módulos de Borda',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    category: 'compute',
    releaseDate: 'Novembro de 2024',
    msrp: '$45 - $95 (dependendo de RAM e eMMC)',
    status: 'Industrial',
    image: cm5Img,
    description: 'A potência do Raspberry Pi 5 em formato de módulo de computação para integração direta em produtos industriais, roteadores profissionais, clusters e equipamentos médicos.',
    soc: 'Broadcom BCM2712 Quad-core ARM Cortex-A76 @ 2.4GHz',
    cpu: 'Quad-core Arm Cortex-A76 @ 2.4 GHz',
    gpu: 'VideoCore VII @ 800 MHz',
    ram: '2GB, 4GB ou 8GB LPDDR4X SDRAM',
    storage: 'Opções com memória flash eMMC de até 64GB soldada ou versão Lite (sem eMMC)',
    videoOut: 'Dual HDMI 4K @ 60Hz expostos pelos conectores de alta densidade',
    audio: 'I2S e HDMI digital',
    networking: 'Gigabit Ethernet PHY embarcado, Wi-Fi Dual Band com conector de antena externa U.FL',
    usb: '2x USB 3.0 nativos + 2x USB 2.0',
    pcie: '1x barramento PCIe 2.0 x1 exposto diretamente nos conectores Hirose',
    gpio: 'Até 50 pinos de E/S multifunção nos conectores de placa',
    power: 'Alimentação regulada de 5V DC via placa base (carrier board)',
    dimensions: '55 x 40 mm (Formato CM4 padrão)',
    keyFeatures: [
      'Conectores Hirose DF40 de 100 pinos duplos intercambiáveis com carrier boards CM4',
      'Memória Flash eMMC de nível industrial de alta retenção',
      'Antena externa opcional para gabinetes metálicos blindados',
      'Suporte para cluster computing (Turing Pi, DeskPi, etc.)'
    ],
    benchmarkScore: 97
  },
  {
    id: 'cm4',
    name: 'Raspberry Pi Compute Module 4 (CM4)',
    badge: 'Padrão da Indústria Embarcada',
    badgeColor: 'border-teal-500/40 text-teal-400 bg-teal-500/10',
    category: 'compute',
    releaseDate: 'Outubro de 2020',
    msrp: '$30 - $75 (32 variantes disponíveis)',
    status: 'Industrial',
    image: cm4Img,
    description: 'O módulo de computação mais adotado pela indústria mundial. Usado em milhares de appliances comerciais, roteadores Dual-GbE, gateways LoRaWAN e servidores NAS.',
    soc: 'Broadcom BCM2711 Quad-core ARM Cortex-A72 @ 1.5GHz',
    cpu: 'Quad-core Arm Cortex-A72 @ 1.5 GHz',
    gpu: 'VideoCore VI',
    ram: '1GB, 2GB, 4GB ou 8GB LPDDR4-3200',
    storage: 'eMMC opcional de 8GB, 16GB ou 32GB (ou versão Lite)',
    videoOut: '2x saídas HDMI até 4K @ 60Hz',
    audio: 'I2S digital e HDMI',
    networking: 'Gigabit Ethernet IEEE 1588, Wi-Fi 802.11ac opcional com antena U.FL',
    usb: '1x USB 2.0 nativo (USB 3.0 disponível via PCIe em carrier boards)',
    pcie: 'PCIe Gen 2 x1 exposto nos conectores (habilita switches SATA ou NVMe)',
    gpio: 'Pinos de E/S completos expostos',
    power: '5V DC via conector da placa base',
    dimensions: '55 x 40 mm',
    keyFeatures: [
      'Mais de 32 variantes combinando RAM, Wi-Fi e eMMC',
      'Conectores compactos Hirose de alta velocidade',
      'Ciclo de vida de produção estendido pela fundação até 2034',
      'Amplo ecossistema de placas base de terceiros'
    ],
    benchmarkScore: 66
  },
  {
    id: 'pi4b',
    name: 'Raspberry Pi 4 Model B',
    badge: 'Popular / Padrão da Indústria',
    badgeColor: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    category: 'sbc',
    releaseDate: 'Junho de 2019',
    msrp: '$35 (1GB) / $45 (2GB) / $55 (4GB) / $75 (8GB)',
    status: 'Ativo',
    image: pi4Img,
    description: 'O cavalo de batalha do ecossistema maker e corporativo. Foi o primeiro Pi a adotar USB-C, saída de vídeo dual 4K, Gigabit Ethernet sem gargalo no USB e portas USB 3.0 de alta velocidade.',
    soc: 'Broadcom BCM2711 (28nm)',
    cpu: 'Quad-core Arm Cortex-A72 @ 1.5 GHz (64-bit, 1MB L2 compartilhado)',
    gpu: 'VideoCore VI @ 500 MHz (OpenGL ES 3.0)',
    ram: '1GB, 2GB, 4GB ou 8GB LPDDR4-2400 SDRAM',
    storage: 'Slot MicroSD de alta velocidade (SDR50)',
    videoOut: '2x Micro-HDMI (Dual display até 4K @ 30Hz ou Single 4K @ 60Hz)',
    audio: 'Jack analógico 3.5mm estéreo de 4 polos (áudio + vídeo composto) e micro-HDMI',
    networking: 'Gigabit Ethernet Real (1000BASE-T), Wi-Fi Dual Band 802.11ac, Bluetooth 5.0',
    usb: '2x USB 3.0 (super speed) + 2x USB 2.0 (via barramento VL805)',
    pcie: 'Não disponível externamente (usado internamente pelo chip USB)',
    gpio: 'Header padrão de 40 pinos totalmente compatível',
    power: '5V / 3.0A DC via conector USB-C',
    dimensions: '85 x 56 mm',
    keyFeatures: [
      'Suporte a 2 monitores simultâneos via conectores micro-HDMI',
      'Porta Gigabit Ethernet de alta velocidade sem compartilhamento USB',
      'Portas USB 3.0 azuis para discos rígidos e pendrives velozes',
      'Conector MIPI CSI para câmera e DSI para telas touchscreen'
    ],
    benchmarkScore: 68
  },
  {
    id: 'pi3bplus',
    name: 'Raspberry Pi 3 Model B+',
    badge: 'Clássico / Altíssima Compatibilidade',
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    category: 'sbc',
    releaseDate: 'Março de 2018',
    msrp: '$35',
    status: 'Legado',
    image: pi3bImg,
    description: 'Um clássico confiável presente em milhares de projetos industriais, fliperamas RetroPie e automação residencial. Traz saída HDMI padrão de tamanho completo e porta de áudio P2.',
    soc: 'Broadcom BCM2837B0',
    cpu: 'Quad-core Arm Cortex-A53 @ 1.4 GHz (64-bit)',
    gpu: 'Broadcom VideoCore IV @ 400 MHz',
    ram: '1GB LPDDR2 SDRAM',
    storage: 'Slot MicroSD clássico',
    videoOut: '1x HDMI padrão tamanho completo (1080p @ 60Hz)',
    audio: 'Jack analógico de 3.5mm e HDMI digital',
    networking: 'Wi-Fi 802.11ac dual band (2.4/5GHz), Bluetooth 4.2 BLE, Gigabit Ethernet sobre USB 2.0 (teto de 300 Mbps)',
    usb: '4x portas USB 2.0',
    pcie: 'Não suportado',
    gpio: 'Header padrão de 40 pinos',
    power: '5V / 2.5A DC via conector Micro-USB',
    dimensions: '85 x 56 mm',
    keyFeatures: [
      'Porta HDMI padrão em tamanho grande (não necessita adaptador)',
      'Blindagem metálica sobre o processador para melhor dissipação térmica',
      'Suporte a Power over Ethernet (PoE) via PoE HAT oficial',
      'Consumo elétrico moderado sob carga contínua'
    ],
    benchmarkScore: 35
  },
  {
    id: 'pi3aplus',
    name: 'Raspberry Pi 3 Model A+',
    badge: 'Formato Compacto HAT / 512MB RAM',
    badgeColor: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10',
    category: 'sbc',
    releaseDate: 'Novembro de 2018',
    msrp: '$25',
    status: 'Legado',
    image: pi3aImg,
    description: 'A versão compacta no formato de placa quadrada (65x56mm). Mantém a mesma CPU quad-core do 3B+, mas remove o chip USB/Ethernet para reduzir consumo, peso e custo.',
    soc: 'Broadcom BCM2837B0 Quad-core ARM Cortex-A53 @ 1.4GHz',
    cpu: 'Quad-core Arm Cortex-A53 @ 1.4 GHz',
    gpu: 'VideoCore IV',
    ram: '512MB LPDDR2 SDRAM',
    storage: 'Slot MicroSD',
    videoOut: '1x HDMI tamanho completo (1080p @ 60Hz)',
    audio: 'Jack P2 analógico de 3.5mm e HDMI',
    networking: 'Wi-Fi 802.11ac Dual-band 2.4/5GHz e Bluetooth 4.2 BLE (Sem porta Ethernet)',
    usb: '1x porta USB 2.0 de tamanho normal',
    pcie: 'Não suportado',
    gpio: 'Header padrão de 40 pinos Raspberry Pi',
    power: '5V / 2.5A via Micro-USB',
    dimensions: '65 x 56 mm (Formato HAT mecânico)',
    keyFeatures: [
      'Perfil plano e leve para drones, robôs móveis e veículos autônomos',
      'Porta HDMI completa sem necessidade de cabos adaptadores',
      'Excelente equilíbrio entre custo ($25) e CPU de 64-bit quad-core',
      'Conector MIPI DSI e CSI para telas e câmeras'
    ],
    benchmarkScore: 33
  },
  {
    id: 'pizero2w',
    name: 'Raspberry Pi Zero 2 W',
    badge: 'Ultra Compacto / IoT Econômico',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    category: 'zero',
    releaseDate: 'Outubro de 2021',
    msrp: '$15',
    status: 'Ativo',
    image: zero2wImg,
    description: 'Computador Linux minúsculo do tamanho de uma caixa de fósforos. É até 5x mais potente que o Zero original graças ao SiP RP3A0 com CPU quad-core de 64 bits.',
    soc: 'RP3A0 SiP (System-in-Package com Die BCM2710A1)',
    cpu: 'Quad-core Arm Cortex-A53 @ 1.0 GHz (64-bit)',
    gpu: 'VideoCore IV',
    ram: '512MB LPDDR2 SDRAM empacotada no mesmo chip SiP',
    storage: 'Slot MicroSD',
    videoOut: 'Mini-HDMI (1080p @ 60Hz)',
    audio: 'Áudio digital via Mini-HDMI',
    networking: 'Wi-Fi 802.11b/g/n 2.4 GHz, Bluetooth 4.2, BLE',
    usb: '1x porta Micro-USB 2.0 com suporte a OTG Host/Device',
    pcie: 'Não suportado',
    gpio: 'Furos para header de 40 pinos (não soldados de fábrica)',
    power: '5V / 2.5A DC via porta Micro-USB dedicada',
    dimensions: '65 x 30 x 5 mm (Apenas 9 gramas de peso)',
    keyFeatures: [
      'Espessura mínima de apenas 5mm para encaixe em caixas compactas',
      'CPU Quad-core no tamanho reduzido de placa Zero',
      'Conector FPC MIPI CSI para módulo de câmera de fita fina',
      'Consumo mínimo em modo de espera (apenas ~0.7W)'
    ],
    benchmarkScore: 28
  },
  {
    id: 'pizerow',
    name: 'Raspberry Pi Zero W (Original)',
    badge: 'O Clássico de $10 Dólares',
    badgeColor: 'border-green-500/40 text-green-400 bg-green-500/10',
    category: 'zero',
    releaseDate: 'Fevereiro de 2017',
    msrp: '$10',
    status: 'Legado',
    image: zeroWImg,
    description: 'A placa que revolucionou o custo da computação embarcada. Por apenas $10, oferecia Linux completo com Wi-Fi e Bluetooth no mesmo fator de forma de bolso.',
    soc: 'Broadcom BCM2835 Single-core ARM11 @ 1.0GHz',
    cpu: 'Single-core ARM1176JZF-S @ 1.0 GHz (32-bit)',
    gpu: 'VideoCore IV',
    ram: '512MB LPDDR2 SDRAM (PoP Package-on-Package)',
    storage: 'Slot MicroSD',
    videoOut: 'Mini-HDMI (1080p)',
    audio: 'Áudio via Mini-HDMI ou PWM',
    networking: 'Wi-Fi 802.11b/g/n 2.4 GHz e Bluetooth 4.1 BLE',
    usb: '1x Micro-USB OTG + 1x Micro-USB alimentação',
    pcie: 'Não suportado',
    gpio: 'Header padrão de 40 pinos (desprovido de pinos soldados)',
    power: '5V / 1.2A via Micro-USB (baixíssimo consumo)',
    dimensions: '65 x 30 mm',
    keyFeatures: [
      'Consumo em repouso de apenas ~100mA (~0.5W)',
      'Ideal para sensores IoT alimentados por painel solar e bateria',
      'Conector de câmera CSI exclusivo da linha Zero',
      'Excelente para emulação de consoles 8-bit e 16-bit'
    ],
    benchmarkScore: 16
  },
  {
    id: 'pico2',
    name: 'Raspberry Pi Pico 2 & Pico 2 W',
    badge: 'Nova Geração RP2350 / ARM + RISC-V',
    badgeColor: 'border-violet-500/40 text-violet-400 bg-violet-500/10',
    category: 'mcu',
    releaseDate: 'Agosto de 2024',
    msrp: '$5 (Pico 2) / $7 (Pico 2 W)',
    status: 'Ativo',
    image: pico2Img,
    description: 'O microcontrolador de silício mais avançado da Raspberry Pi. O chip RP2350 traz inovação pioneira mundial: processadores dual-core chaveáveis entre ARM Cortex-M33 e RISC-V Hazard3 com segurança de hardware TrustZone.',
    soc: 'Raspberry Pi RP2350 (Dual Cortex-M33 ou Dual Hazard3 RISC-V @ 150MHz)',
    cpu: 'Dual-core ARM Cortex-M33 com FPU ou Dual Hazard3 RISC-V selecionável no boot',
    gpu: 'Não aplicável (Microcontrolador de precisão)',
    ram: '520 KB de memória SRAM em 10 bancos independentes (quase o dobro do Pico 1)',
    storage: '4MB de memória Flash QSPI embarcada',
    videoOut: 'Saídas DVI/HDMI digitais de alta taxa via blocos PIO',
    audio: 'I2S e hardware PWM',
    networking: 'Na versão Pico 2 W: Wi-Fi 4 802.11n e Bluetooth 5.2 integrado',
    usb: 'Micro-USB 1.1 Host e Device',
    pcie: 'Não suportado',
    gpio: '26 pinos GPIO multifunção, 4 entradas analógicas ADC de 12-bit',
    power: '1.8V a 5.5V DC com regulador buck chaveado interno',
    dimensions: '51 x 21 mm',
    keyFeatures: [
      'Arquitetura híbrida inédita: execute núcleos ARM ou núcleos RISC-V',
      'Segurança Arm TrustZone, boot seguro assinado e OTP de 8KB',
      '12 blocos de PIO (Programmable I/O) com 3 máquinas de estado cada',
      'Pinos com orifícios castellated para montagem em superfície'
    ],
    benchmarkScore: 18
  },
  {
    id: 'pico',
    name: 'Raspberry Pi Pico & Pico W (RP2040)',
    badge: 'Microcontrolador em Tempo Real',
    badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
    category: 'mcu',
    releaseDate: 'Janeiro de 2021',
    msrp: '$4 (Pico) / $6 (Pico W)',
    status: 'Ativo',
    image: picoImg,
    description: 'A primeira incursão da fundação no silício próprio. O chip RP2040 tornou-se um fenômeno global em teclados customizados, joysticks de arcade, instrumentos e robótica.',
    soc: 'Raspberry Pi RP2040 (Dual ARM Cortex-M0+ @ 133MHz)',
    cpu: 'Dual-core Arm Cortex-M0+ com clock flexível até 133 MHz',
    gpu: 'Não aplicável (Microcontrolador puro)',
    ram: '264 KB de SRAM em 6 bancos independentes',
    storage: '2MB de memória Flash QSPI embarcada',
    videoOut: 'Possível via bitbanging DVI/VGA nos pinos PIO',
    audio: 'PWM digital e barramento I2S para áudio DAC',
    networking: 'Na versão Pico W: Wi-Fi 4 (802.11n) e Bluetooth 5.2 via chip CYW43439',
    usb: 'Micro-USB 1.1 com suporte a Host e Device (emulação de teclado, mouse, joystick)',
    pcie: 'Não suportado',
    gpio: '40 pinos no formato castellated (26 pinos GPIO multifunção, ADC de 12-bit)',
    power: '1.8V a 5.5V DC (Baterias de Lítio, pilhas AA ou USB)',
    dimensions: '51 x 21 mm',
    keyFeatures: [
      '8 máquinas de estado programáveis PIO (Programmable I/O) de alta velocidade',
      'Conversor Analógico-Digital (ADC) de 12-bit com 500 ksps',
      'Programável em MicroPython, CircuitPython, C/C++ SDK e Arduino IDE',
      'Preço extremamente acessível a partir de $4 dólares'
    ],
    benchmarkScore: 12
  },
  {
    id: 'pi400',
    name: 'Raspberry Pi 400',
    badge: 'Computador Tudo-em-Um em Teclado',
    badgeColor: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
    category: 'keyboard',
    releaseDate: 'Novembro de 2020',
    msrp: '$70 (Apenas computador) / $100 (Kit completo)',
    status: 'Ativo',
    image: pi400Img,
    description: 'O computador clássico reimaginado: um teclado ergonômico completo com uma placa de Raspberry Pi 4 especialmente retrabalhada com enorme dissipador térmico embutido e clock aumentado para 1.8GHz.',
    soc: 'Broadcom BCM2711C0',
    cpu: 'Quad-core Arm Cortex-A72 @ 1.8 GHz (overclock de fábrica graças à refrigeração passiva integral)',
    gpu: 'VideoCore VI @ 500 MHz',
    ram: '4GB LPDDR4-3200 SDRAM',
    storage: 'Slot MicroSD lateral',
    videoOut: '2x Micro-HDMI (Dual 4K @ 60Hz)',
    audio: 'Digital via Micro-HDMI',
    networking: 'Gigabit Ethernet, Wi-Fi 802.11ac, Bluetooth 5.0',
    usb: '2x USB 3.0 + 1x USB 2.0 (para mouse externo)',
    pcie: 'Não exposto',
    gpio: 'Header padrão de 40 pinos na traseira do teclado',
    power: '5V / 3.0A via conector USB-C',
    dimensions: '286 x 122 x 23 mm (Teclado padrão 78 ou 79 teclas)',
    keyFeatures: [
      'Chapa dissipadora de alumínio que cobre toda a extensão do teclado (silencioso e frio)',
      'Ideal para salas de aula, laboratórios escolares e estações de trabalho rápidas',
      'Header GPIO acessível na traseira para conexão de sensores e módulos',
      'Layout resistente e pronto para ligar na TV ou monitor'
    ],
    benchmarkScore: 74
  },
  {
    id: 'pi1bplus',
    name: 'Raspberry Pi 1 Model B+ (2014)',
    badge: 'O Criador do Padrão 40 Pinos',
    badgeColor: 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10',
    category: 'sbc',
    releaseDate: 'Julho de 2014',
    msrp: '$35 (No lançamento)',
    status: 'Legado',
    image: pi1bImg,
    description: 'A placa histórica mais influente da era maker. Foi neste modelo em 2014 que a Raspberry Pi ampliou o header de 26 para 40 pinos GPIO, criando o padrão físico que permanece idêntico até o Raspberry Pi 5!',
    soc: 'Broadcom BCM2835',
    cpu: 'Single-core ARM1176JZF-S @ 700 MHz (overclock de até 1.0 GHz)',
    gpu: 'Broadcom VideoCore IV com decodificador H.264 Full HD',
    ram: '512MB LPDDR2 SDRAM',
    storage: 'Slot MicroSD tipo push-push (substituindo o antigo cartão SD grande)',
    videoOut: '1x HDMI padrão 1080p + Saída de vídeo composto no conector P2 de 4 polos',
    audio: 'Saída analógica 3.5mm estéreo aprimorada com circuito de baixo ruído',
    networking: 'Ethernet 10/100 Mbps (Microchip LAN9514)',
    usb: '4x portas USB 2.0 (com limitador de corrente aprimorado)',
    pcie: 'Não suportado',
    gpio: 'Header pioneiro de 40 pinos GPIO padrão HAT',
    power: '5V / 2.0A via conector Micro-USB',
    dimensions: '85 x 56 mm (Design clássico com 4 furos de montagem)',
    keyFeatures: [
      'Estreou os 4 furos de fixação com parafusos e cantos arredondados',
      'Definiu a especificação HAT (Hardware Attached on Top) com ID EEPROM',
      'Regulador chaveado mais eficiente que reduziu o consumo em 1 Watt',
      'Peça de colecionador e marco na história da computação acessível'
    ],
    benchmarkScore: 10
  }
];
