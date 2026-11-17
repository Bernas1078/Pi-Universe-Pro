import pi5Img from '../assets/images/raspberry_pi_5_board_1793723065529.jpg';
import pi4Img from '../assets/images/raspberry_pi_4_board_1793723065874.jpg';
import pi3bImg from '../assets/images/raspberry_pi_3b_plus_1793723085999.jpg';
import pi3aImg from '../assets/images/raspberry_pi_3a_plus_1793723705155.jpg';
import pi1bImg from '../assets/images/raspberry_pi_1b_plus_1793723706058.jpg';
import zero2wImg from '../assets/images/raspberry_pi_zero_2w_1793723067264.jpg';
import zeroWImg from '../assets/images/raspberry_pi_zero_w_1793723721081.jpg';
import picoImg from '../assets/images/raspberry_pi_pico_board_1793723068522.jpg';
import pico2Img from '../assets/images/raspberry_pi_pico2_1793723704464.jpg';
import pi400Img from '../assets/images/raspberry_pi_400_computer_1793723086949.jpg';
import cm4Img from '../assets/images/raspberry_pi_cm4_1793723703909.jpg';
import cm5Img from '../assets/images/raspberry_pi_cm5_1793723721153.jpg';
import orangePiImg from '../assets/images/orange_pi_5_plus_1793723070308.jpg';
import radxaImg from '../assets/images/radxa_rock_5b_1793723086608.jpg';
import bananaPiImg from '../assets/images/banana_pi_bpi_m5_1793723947984.jpg';
import jetsonImg from '../assets/images/nvidia_jetson_orin_nano_1793723932623.jpg';
import khadasImg from '../assets/images/khadas_vim4_board_1793723930984.jpg';
import odroidImg from '../assets/images/odroid_n2_plus_1793723933361.jpg';
import milkvImg from '../assets/images/milkv_mars_riscv_1793723932136.jpg';
import gearImg from '../assets/images/pi_accessories_gear_1793723069164.jpg';

export interface PresetImage {
  key: string;
  title: string;
  category: 'board' | 'accessory';
  src: string;
  tags: string[];
}

export interface DbImageAsset {
  id: string;
  ownerId: string;
  ownerName: string;
  isPublic: boolean;
  title: string;
  category: 'board' | 'accessory' | 'pinout' | 'other';
  sourceType: 'url' | 'preset' | 'compressed';
  url: string;
  altText?: string;
  tags: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export const BUILTIN_IMAGE_PRESETS: PresetImage[] = [
  { key: 'preset:pi5', title: 'Raspberry Pi 5 (Estúdio)', category: 'board', src: pi5Img, tags: ['raspberry', 'pi5', 'sbc'] },
  { key: 'preset:cm5', title: 'Compute Module 5 (CM5)', category: 'board', src: cm5Img, tags: ['raspberry', 'cm5', 'industrial'] },
  { key: 'preset:cm4', title: 'Compute Module 4 (CM4)', category: 'board', src: cm4Img, tags: ['raspberry', 'cm4', 'industrial'] },
  { key: 'preset:pi4b', title: 'Raspberry Pi 4 Model B', category: 'board', src: pi4Img, tags: ['raspberry', 'pi4', 'sbc'] },
  { key: 'preset:pi3bplus', title: 'Raspberry Pi 3 Model B+', category: 'board', src: pi3bImg, tags: ['raspberry', 'pi3', 'sbc'] },
  { key: 'preset:pi3aplus', title: 'Raspberry Pi 3 Model A+', category: 'board', src: pi3aImg, tags: ['raspberry', 'pi3a', 'compact'] },
  { key: 'preset:pi1bplus', title: 'Raspberry Pi 1 Model B+', category: 'board', src: pi1bImg, tags: ['raspberry', 'legado', 'sbc'] },
  { key: 'preset:pizero2w', title: 'Raspberry Pi Zero 2 W', category: 'board', src: zero2wImg, tags: ['raspberry', 'zero', 'iot'] },
  { key: 'preset:pizerow', title: 'Raspberry Pi Zero W', category: 'board', src: zeroWImg, tags: ['raspberry', 'zero', 'iot'] },
  { key: 'preset:pico2', title: 'Raspberry Pi Pico 2 (RP2350)', category: 'board', src: pico2Img, tags: ['pico', 'rp2350', 'mcu'] },
  { key: 'preset:pico', title: 'Raspberry Pi Pico (RP2040)', category: 'board', src: picoImg, tags: ['pico', 'rp2040', 'mcu'] },
  { key: 'preset:pi400', title: 'Raspberry Pi 400 (Teclado)', category: 'board', src: pi400Img, tags: ['raspberry', 'pi400', 'teclado'] },
  { key: 'preset:nvidiajetson', title: 'NVIDIA Jetson Orin Nano', category: 'board', src: jetsonImg, tags: ['nvidia', 'jetson', 'ia'] },
  { key: 'preset:orangepi5plus', title: 'Orange Pi 5 Plus', category: 'board', src: orangePiImg, tags: ['orangepi', 'rk3588', 'sbc'] },
  { key: 'preset:radxarock5b', title: 'Radxa Rock 5B', category: 'board', src: radxaImg, tags: ['radxa', 'rk3588', 'sbc'] },
  { key: 'preset:khadasvim4', title: 'Khadas VIM4', category: 'board', src: khadasImg, tags: ['khadas', 'vim4', 'sbc'] },
  { key: 'preset:odroidn2plus', title: 'Hardkernel ODROID-N2+', category: 'board', src: odroidImg, tags: ['odroid', 'hardkernel', 'sbc'] },
  { key: 'preset:bananapim5', title: 'Banana Pi BPI-M5', category: 'board', src: bananaPiImg, tags: ['bananapi', 'sbc'] },
  { key: 'preset:milkvmars', title: 'Milk-V Mars (RISC-V)', category: 'board', src: milkvImg, tags: ['milkv', 'riscv', 'sbc'] },
  { key: 'preset:gear', title: 'Kit Oficial de Acessórios', category: 'accessory', src: gearImg, tags: ['acessorios', 'cooler', 'hat'] }
];

const PRESET_MAP: Record<string, string> = Object.fromEntries(
  BUILTIN_IMAGE_PRESETS.map((p) => [p.key, p.src])
);

export function resolveImageSrc(
  image: string,
  imageId?: string,
  dbImages?: DbImageAsset[]
): string {
  if (imageId && dbImages) {
    const found = dbImages.find((img) => img.id === imageId);
    if (found) {
      if (found.url.startsWith('preset:')) {
        return PRESET_MAP[found.url] || pi5Img;
      }
      return found.url;
    }
  }
  if (image.startsWith('imageRef:') && dbImages) {
    const refId = image.slice('imageRef:'.length);
    const found = dbImages.find((img) => img.id === refId);
    if (found) {
      if (found.url.startsWith('preset:')) {
        return PRESET_MAP[found.url] || pi5Img;
      }
      return found.url;
    }
  }
  if (image.startsWith('preset:')) {
    return PRESET_MAP[image] || pi5Img;
  }
  if (image.startsWith('https://') || image.startsWith('data:image/')) {
    return image;
  }
  return pi5Img;
}

/**
 * Resizes and compresses a local image file to a lightweight WebP/JPEG data URI
 * strictly capped below 90,000 characters to comply with Firestore blueprint limits.
 */
export function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('O ficheiro selecionado não é uma imagem válida.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler o ficheiro de imagem.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagem não suportado pelo navegador.'));
      img.onload = () => {
        const maxWidth = 560;
        const maxHeight = 360;
        let { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
        width = Math.max(1, Math.round(width * ratio));
        height = Math.max(1, Math.round(height * ratio));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Erro ao inicializar o processador gráfico (Canvas).'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        const qualities = [0.78, 0.65, 0.5, 0.35];
        for (const q of qualities) {
          let dataUrl = canvas.toDataURL('image/webp', q);
          if (!dataUrl.startsWith('data:image/webp;base64,')) {
            dataUrl = canvas.toDataURL('image/jpeg', q);
          }
          if (dataUrl.length <= 92000) {
            resolve(dataUrl);
            return;
          }
        }

        // Final smaller resize fallback
        canvas.width = Math.round(width * 0.65);
        canvas.height = Math.round(height * 0.65);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const fallback = canvas.toDataURL('image/jpeg', 0.45);
        if (fallback.length <= 95000) {
          resolve(fallback);
        } else {
          reject(new Error('A imagem é demasiado complexa. Utilize uma imagem mais pequena ou cole um link HTTPS.'));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
