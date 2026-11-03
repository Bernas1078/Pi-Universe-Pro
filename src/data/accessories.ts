import gearImg from '../assets/images/pi_accessories_gear_1793723069164.jpg';

export interface AccessoryItem {
  id: string;
  name: string;
  category: 'power' | 'cooling' | 'storage' | 'camera' | 'display' | 'hat';
  compatibility: string[];
  msrp: string;
  specs: string;
  description: string;
  whyNeeded: string;
  image: string;
  powerDrawWatts: number;
}

export const ACCESSORIES_LIST: AccessoryItem[] = [
  {
    id: 'power-27w',
    name: 'Fonte Oficial Raspberry Pi 27W USB-C PD',
    category: 'power',
    compatibility: ['Raspberry Pi 5', 'Raspberry Pi 4', 'Raspberry Pi 400'],
    msrp: '$12',
    specs: '5.1V / 5.0A, 9V / 3.0A, 12V / 2.25A, 15V / 1.8A (Power Delivery)',
    description: 'A fonte oficial projetada sob medida para o Raspberry Pi 5. Capaz de fornecer 5.1V a 5.0A contínuos para permitir que o Pi 5 alimente SSDs NVMe e até 1.6A combinados nas 4 portas USB sem throttling.',
    whyNeeded: 'Sem uma fonte 5V/5A com perfil PD proprietário, o Pi 5 limita a corrente das portas USB a 600mA para segurança, impedindo o funcionamento confiável de múltiplos periféricos.',
    image: gearImg,
    powerDrawWatts: 0
  },
  {
    id: 'active-cooler',
    name: 'Active Cooler Oficial para Pi 5',
    category: 'cooling',
    compatibility: ['Raspberry Pi 5'],
    msrp: '$5',
    specs: 'Dissipador de alumínio anodizado monobloco + ventoinha PWM controlada termicamente por tacômetro',
    description: 'Encaixa-se diretamente nos furos com molas de fixação do Raspberry Pi 5 e conecta-se no conector JST de 4 pinos. Possui pads térmicos para resfriar a CPU, o chip de I/O RP1 e o circuito de gerenciamento PMIC.',
    whyNeeded: 'O BCM2712 atinge frequências altas de 2.4GHz e dissipa calor rapidamente. O cooler ativo mantém a temperatura abaixo de 60°C sob estresse máximo sem gerar ruído em repouso.',
    image: gearImg,
    powerDrawWatts: 0.6
  },
  {
    id: 'm2-hat',
    name: 'M.2 NVMe HAT+ Oficial (M-Key)',
    category: 'storage',
    compatibility: ['Raspberry Pi 5'],
    msrp: '$12',
    specs: 'Suporta unidades M.2 formato 2230 e 2242, taxa de transferência PCIe Gen 2 (500 MB/s) e Gen 3 não-oficial (850 MB/s)',
    description: 'Placa de expansão oficial que se conecta ao barramento PCIe FFC do Pi 5. Permite inicializar o Raspberry Pi OS diretamente do SSD NVMe com tempos de carregamento instantâneos.',
    whyNeeded: 'Cartões MicroSD convencionais sofrem degradação rápida sob gravações contínuas (logs, bancos de dados, Docker). O SSD NVMe oferece durabilidade extrema e velocidade 10x superior.',
    image: gearImg,
    powerDrawWatts: 2.5
  },
  {
    id: 'camera-module-3',
    name: 'Raspberry Pi Camera Module 3 (Wide / Standard)',
    category: 'camera',
    compatibility: ['Raspberry Pi 5', 'Raspberry Pi 4', 'Pi 3', 'Pi Zero 2 W (com cabo FPC fino)'],
    msrp: '$25 - $35',
    specs: 'Sensor Sony IMX708 com resolução de 12 Megapixels, autofoco eletromagnético (PDAF), modo HDR e 120fps em 720p',
    description: 'Câmera com foco automático integrado controlado por software via libcamera. Captura fotos com nitidez milimétrica e grava vídeos em Full HD e 4K.',
    whyNeeded: 'Fundamental para visão computacional com OpenCV, monitoramento de impressoras 3D com OctoPrint/Klipper, câmeras de segurança e reconhecimento facial.',
    image: gearImg,
    powerDrawWatts: 1.2
  },
  {
    id: 'sandisk-endurance',
    name: 'Cartão MicroSD SanDisk Max Endurance A2',
    category: 'storage',
    compatibility: ['Todos os modelos Raspberry Pi'],
    msrp: '$15 (64GB) / $25 (128GB)',
    specs: 'Classe 10, U3, V30, A2 para alta taxa de operações IOPS aleatórias',
    description: 'Projetado especificamente para gravação contínua 24/7 sem corrupção de sistema operacional.',
    whyNeeded: 'Sistemas Linux fazem centenas de escritas em log a cada minuto. Cartões convencionais corrompem após alguns meses sem a certificação Endurance.',
    image: gearImg,
    powerDrawWatts: 0.5
  },
  {
    id: 'official-case-pi5',
    name: 'Case Oficial Modular com Cooler Embutido',
    category: 'cooling',
    compatibility: ['Raspberry Pi 5'],
    msrp: '$10',
    specs: 'Gabinete de 4 partes em plástico ABS vermelho e branco, ventoinha de 30mm PWM inclusa e tampa destacável para acesso ao GPIO',
    description: 'Protege os componentes da placa contra contato acidental com objetos metálicos e garante fluxo de ar direcionado sobre o processador.',
    whyNeeded: 'Segurança contra curtos-circuitos em bancadas de trabalho e proteção estética elegante para o seu ambiente.',
    image: gearImg,
    powerDrawWatts: 0.4
  }
];
