export interface GpioPin {
  pin: number;
  name: string;
  type: 'power3v3' | 'power5v' | 'gnd' | 'gpio' | 'i2c' | 'spi' | 'uart' | 'pwm' | 'id';
  bcm: string;
  wiringPi?: number;
  desc: string;
  descDetail?: string;
  warning?: string;
  defaultPull?: 'Pull-Up' | 'Pull-Down' | 'Nenhum';
  altFunctions?: string[];
  maxCurrentMa?: number;
}

export const GPIO_PINS: GpioPin[] = [
  {
    pin: 1,
    name: '3.3V Power',
    type: 'power3v3',
    bcm: '-',
    desc: 'Linha de alimentação regulada de 3.3 Volts conectada ao PMIC da placa.',
    warning: 'Limite máximo de corrente combinado para todos os pinos de 3.3V é de aproximadamente 50mA a 100mA em cargas externas.',
    defaultPull: 'Nenhum'
  },
  {
    pin: 2,
    name: '5.0V Power',
    type: 'power5v',
    bcm: '-',
    desc: 'Linha de 5 Volts conectada diretamente ao barramento de entrada da fonte USB.',
    warning: 'Não possui fusível individual nos modelos mais recentes. Qualquer curto aqui pode desarmar a fonte ou reiniciar o Pi.',
    defaultPull: 'Nenhum'
  },
  {
    pin: 3,
    name: 'GPIO 2 (SDA)',
    type: 'i2c',
    bcm: 'BCM 2',
    wiringPi: 8,
    desc: 'Barramento I2C 1 - Linha de Dados Serial (SDA). Usado para conectar displays OLED, sensores BMP280, acelerômetros, etc.',
    warning: 'Possui resistor físico de pull-up de 1.8 kΩ soldado na placa para a linha de 3.3V.',
    defaultPull: 'Pull-Up',
    altFunctions: ['I2C1_SDA', 'SMI_SA3']
  },
  {
    pin: 4,
    name: '5.0V Power',
    type: 'power5v',
    bcm: '-',
    desc: 'Segunda linha de 5 Volts de alta potência.',
    warning: 'Ideal para alimentar ventoinhas simples ou HATs que demandam 5V.',
    defaultPull: 'Nenhum'
  },
  {
    pin: 5,
    name: 'GPIO 3 (SCL)',
    type: 'i2c',
    bcm: 'BCM 3',
    wiringPi: 9,
    desc: 'Barramento I2C 1 - Linha de Clock Serial (SCL). Fornece o sinal de sincronismo para comunicação I2C.',
    warning: 'Também possui resistor pull-up de 1.8 kΩ físico embutido na placa.',
    defaultPull: 'Pull-Up',
    altFunctions: ['I2C1_SCL', 'SMI_SA2']
  },
  {
    pin: 6,
    name: 'GND (Ground)',
    type: 'gnd',
    bcm: '-',
    desc: 'Terra / Referência elétrica de 0 Volts do sistema.',
    defaultPull: 'Nenhum'
  },
  {
    pin: 7,
    name: 'GPIO 4 (GPCLK0)',
    type: 'gpio',
    bcm: 'BCM 4',
    wiringPi: 7,
    desc: 'Pino GPIO de uso geral / Clock de Uso Geral 0. Frequentemente usado para sensores de temperatura 1-Wire como DS18B20.',
    defaultPull: 'Pull-Up',
    altFunctions: ['GPCLK0', '1-Wire Default']
  },
  {
    pin: 8,
    name: 'GPIO 14 (TXD)',
    type: 'uart',
    bcm: 'BCM 14',
    wiringPi: 15,
    desc: 'Transmissor da Porta Serial UART (Serial TX). Utilizado para consoles de depuração e comunicação com Arduino ou GPS.',
    defaultPull: 'Pull-Down',
    altFunctions: ['UART0_TXD', 'TXD0']
  },
  {
    pin: 9,
    name: 'GND (Ground)',
    type: 'gnd',
    bcm: '-',
    desc: 'Terra / Referência elétrica de 0 Volts.',
    defaultPull: 'Nenhum'
  },
  {
    pin: 10,
    name: 'GPIO 15 (RXD)',
    type: 'uart',
    bcm: 'BCM 15',
    wiringPi: 16,
    desc: 'Receptor da Porta Serial UART (Serial RX). Recebe dados em nível lógico de 3.3V.',
    warning: 'Nunca conecte diretamente uma saída serial RS232 de 12V ou lógica 5V sem divisor de tensão resistivo!',
    defaultPull: 'Pull-Down',
    altFunctions: ['UART0_RXD', 'RXD0']
  },
  {
    pin: 11,
    name: 'GPIO 17',
    type: 'gpio',
    bcm: 'BCM 17',
    wiringPi: 0,
    desc: 'Pino GPIO de uso geral para entrada digital (botões, sensores PIR) ou saída (relés, LEDs).',
    defaultPull: 'Pull-Down',
    altFunctions: ['UART0_RTS', 'SPI1_CE1']
  },
  {
    pin: 12,
    name: 'GPIO 18 (PWM0)',
    type: 'pwm',
    bcm: 'BCM 18',
    wiringPi: 1,
    desc: 'GPIO com suporte a Hardware PWM (Modulação por Largura de Pulso - Canal 0) e interface de áudio PCM CLK.',
    descDetail: 'Perfeito para controle de velocidade de motores sem jitter e servos de alta precisão.',
    defaultPull: 'Pull-Down',
    altFunctions: ['PWM0', 'PCM_CLK']
  },
  {
    pin: 13,
    name: 'GPIO 27',
    type: 'gpio',
    bcm: 'BCM 27',
    wiringPi: 2,
    desc: 'Pino GPIO padrão digital de alta impedância configurável via software.',
    defaultPull: 'Pull-Down'
  },
  {
    pin: 14,
    name: 'GND (Ground)',
    type: 'gnd',
    bcm: '-',
    desc: 'Terra / Referência de 0V comum.',
    defaultPull: 'Nenhum'
  },
  {
    pin: 15,
    name: 'GPIO 22',
    type: 'gpio',
    bcm: 'BCM 22',
    wiringPi: 3,
    desc: 'Pino GPIO padrão configurável para entrada ou saída lógica.',
    defaultPull: 'Pull-Down'
  },
  {
    pin: 16,
    name: 'GPIO 23',
    type: 'gpio',
    bcm: 'BCM 23',
    wiringPi: 4,
    desc: 'Pino GPIO digital de uso geral.',
    defaultPull: 'Pull-Down'
  },
  {
    pin: 17,
    name: '3.3V Power',
    type: 'power3v3',
    bcm: '-',
    desc: 'Linha secundária de alimentação de 3.3 Volts.',
    defaultPull: 'Nenhum'
  },
  {
    pin: 18,
    name: 'GPIO 24',
    type: 'gpio',
    bcm: 'BCM 24',
    wiringPi: 5,
    desc: 'Pino GPIO digital padrão.',
    defaultPull: 'Pull-Down'
  },
  {
    pin: 19,
    name: 'GPIO 10 (MOSI)',
    type: 'spi',
    bcm: 'BCM 10',
    wiringPi: 12,
    desc: 'Barramento SPI 0 - Linha Master Out Slave In (MOSI). Envia dados do Pi para telas TFT, cartões SD ou chips ADC.',
    defaultPull: 'Pull-Down',
    altFunctions: ['SPI0_MOSI']
  },
  {
    pin: 20,
    name: 'GND (Ground)',
    type: 'gnd',
    bcm: '-',
    desc: 'Terra / 0V elétrico.',
    defaultPull: 'Nenhum'
  },
  {
    pin: 21,
    name: 'GPIO 9 (MISO)',
    type: 'spi',
    bcm: 'BCM 9',
    wiringPi: 13,
    desc: 'Barramento SPI 0 - Linha Master In Slave Out (MISO). Recebe dados periféricos no barramento SPI.',
    defaultPull: 'Pull-Down',
    altFunctions: ['SPI0_MISO']
  },
  {
    pin: 22,
    name: 'GPIO 25',
    type: 'gpio',
    bcm: 'BCM 25',
    wiringPi: 6,
    desc: 'Pino GPIO de uso geral, amplamente utilizado para reset ou seleção de módulos.',
    defaultPull: 'Pull-Down'
  },
  {
    pin: 23,
    name: 'GPIO 11 (SCLK)',
    type: 'spi',
    bcm: 'BCM 11',
    wiringPi: 14,
    desc: 'Barramento SPI 0 - Linha de Clock Serial (SCLK). Sincroniza transferências SPI de até dezenas de MHz.',
    defaultPull: 'Pull-Down',
    altFunctions: ['SPI0_SCLK']
  },
  {
    pin: 24,
    name: 'GPIO 8 (CE0)',
    type: 'spi',
    bcm: 'BCM 8',
    wiringPi: 10,
    desc: 'Barramento SPI 0 - Chip Enable 0 (CE0 / SS). Habilita o primeiro dispositivo escravo no barramento SPI.',
    defaultPull: 'Pull-Up',
    altFunctions: ['SPI0_CE0_N']
  },
  {
    pin: 25,
    name: 'GND (Ground)',
    type: 'gnd',
    bcm: '-',
    desc: 'Terra / 0V.',
    defaultPull: 'Nenhum'
  },
  {
    pin: 26,
    name: 'GPIO 7 (CE1)',
    type: 'spi',
    bcm: 'BCM 7',
    wiringPi: 11,
    desc: 'Barramento SPI 0 - Chip Enable 1 (CE1). Habilita o segundo dispositivo escravo SPI.',
    defaultPull: 'Pull-Up',
    altFunctions: ['SPI0_CE1_N']
  },
  {
    pin: 27,
    name: 'ID_SD (HAT EEPROM)',
    type: 'id',
    bcm: 'BCM 0 / ID_SD',
    wiringPi: 30,
    desc: 'Linha I2C dedicada (ID_EEPROM) para autodeteção de placas de expansão oficiais (HATs).',
    warning: 'Reservado para a especificação oficial de HATs. Não deve ser usado para circuitos caseiros comuns, pois o bootloader lê esta porta ao iniciar.',
    defaultPull: 'Pull-Up'
  },
  {
    pin: 28,
    name: 'ID_SC (HAT EEPROM)',
    type: 'id',
    bcm: 'BCM 1 / ID_SC',
    wiringPi: 31,
    desc: 'Linha de clock I2C para memória EEPROM em placas HAT.',
    warning: 'Reservado para o kernel e Device Tree.',
    defaultPull: 'Pull-Up'
  },
  {
    pin: 29,
    name: 'GPIO 5',
    type: 'gpio',
    bcm: 'BCM 5',
    wiringPi: 21,
    desc: 'Pino GPIO padrão digital.',
    defaultPull: 'Pull-Up'
  },
  {
    pin: 30,
    name: 'GND (Ground)',
    type: 'gnd',
    bcm: '-',
    desc: 'Terra / 0V.',
    defaultPull: 'Nenhum'
  },
  {
    pin: 31,
    name: 'GPIO 6',
    type: 'gpio',
    bcm: 'BCM 6',
    wiringPi: 22,
    desc: 'Pino GPIO de uso geral.',
    defaultPull: 'Pull-Up'
  },
  {
    pin: 32,
    name: 'GPIO 12 (PWM0)',
    type: 'pwm',
    bcm: 'BCM 12',
    wiringPi: 26,
    desc: 'Segundo pino com suporte a Hardware PWM (Canal 0). Gera onda quadrada analógica com precisão em nanossegundos.',
    defaultPull: 'Pull-Down',
    altFunctions: ['PWM0', 'DSI_TE']
  },
  {
    pin: 33,
    name: 'GPIO 13 (PWM1)',
    type: 'pwm',
    bcm: 'BCM 13',
    wiringPi: 23,
    desc: 'Canal Hardware PWM 1 independente. Permite controlar brilho de fitas LED ou som com frequência ajustável.',
    defaultPull: 'Pull-Down',
    altFunctions: ['PWM1']
  },
  {
    pin: 34,
    name: 'GND (Ground)',
    type: 'gnd',
    bcm: '-',
    desc: 'Terra / 0V.',
    defaultPull: 'Nenhum'
  },
  {
    pin: 35,
    name: 'GPIO 19 (PWM1 / PCM)',
    type: 'pwm',
    bcm: 'BCM 19',
    wiringPi: 24,
    desc: 'Pino multifunção: Hardware PWM Canal 1 e sinal de PCM Frame Sync (para placas de áudio Hi-Fi DAC).',
    defaultPull: 'Pull-Down',
    altFunctions: ['PWM1', 'PCM_FS', 'MII_RX_ER']
  },
  {
    pin: 36,
    name: 'GPIO 16',
    type: 'gpio',
    bcm: 'BCM 16',
    wiringPi: 27,
    desc: 'Pino GPIO digital padrão.',
    defaultPull: 'Pull-Down',
    altFunctions: ['SPI1_CE2', 'UART0_CTS']
  },
  {
    pin: 37,
    name: 'GPIO 26',
    type: 'gpio',
    bcm: 'BCM 26',
    wiringPi: 25,
    desc: 'Pino GPIO de uso geral.',
    defaultPull: 'Pull-Down'
  },
  {
    pin: 38,
    name: 'GPIO 20 (PCM_DIN)',
    type: 'gpio',
    bcm: 'BCM 20',
    wiringPi: 28,
    desc: 'GPIO e entrada de áudio digital PCM Data In (microfones I2S).',
    defaultPull: 'Pull-Down',
    altFunctions: ['PCM_DIN', 'SPI1_MOSI']
  },
  {
    pin: 39,
    name: 'GND (Ground)',
    type: 'gnd',
    bcm: '-',
    desc: 'Terra / 0V.',
    defaultPull: 'Nenhum'
  },
  {
    pin: 40,
    name: 'GPIO 21 (PCM_DOUT)',
    type: 'gpio',
    bcm: 'BCM 21',
    wiringPi: 29,
    desc: 'GPIO e saída de áudio digital PCM Data Out (alto-falantes I2S e amplificadores).',
    defaultPull: 'Pull-Down',
    altFunctions: ['PCM_DOUT', 'SPI1_SCLK']
  }
];

export function getPinTypeBadge(type: GpioPin['type']) {
  switch (type) {
    case 'power3v3':
      return { label: '3.3V', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', dot: 'bg-amber-400' };
    case 'power5v':
      return { label: '5.0V', bg: 'bg-red-500/20 text-red-300 border-red-500/40', dot: 'bg-red-500' };
    case 'gnd':
      return { label: 'GND', bg: 'bg-zinc-700/40 text-zinc-300 border-zinc-600', dot: 'bg-zinc-400' };
    case 'i2c':
      return { label: 'I2C', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', dot: 'bg-cyan-400' };
    case 'spi':
      return { label: 'SPI', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', dot: 'bg-indigo-400' };
    case 'uart':
      return { label: 'UART', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40', dot: 'bg-purple-400' };
    case 'pwm':
      return { label: 'PWM', bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40', dot: 'bg-yellow-400' };
    case 'id':
      return { label: 'ID EEPROM', bg: 'bg-pink-500/20 text-pink-300 border-pink-500/40', dot: 'bg-pink-400' };
    default:
      return { label: 'GPIO', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', dot: 'bg-emerald-400' };
  }
}
