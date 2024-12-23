export interface ColorCard {
  color: string;
  name?: string;
  zhName: string;
  pinyin?: string;
  rgb?: string;
  cmyk?: string;
  description: string;
  year?: number;
}

export const colorCards: ColorCard[] = [
  {
    color: '#FF6F61',
    name: 'Living Coral',
    zhName: '活珊瑚橘',
    pinyin: 'huó shān hú jú',
    rgb: '255, 111, 97',
    cmyk: '0, 56, 62, 0',
    description: '充满活力与生命力的珊瑚色调，象征着自然的温暖与滋养',
    year: 2019
  },
  {
    color: '#0F4C81',
    name: 'Classic Blue',
    zhName: '经典蓝',
    pinyin: 'jīng diǎn lán',
    rgb: '15, 76, 129',
    cmyk: '88, 41, 0, 49',
    description: '沉稳而深邃的蓝色，象征着信任、信心和永恒',
    year: 2020
  },
  {
    color: '#939597',
    name: 'Ultimate Gray',
    zhName: '极致灰',
    pinyin: 'jí zhì huī',
    rgb: '147, 149, 151',
    cmyk: '0, 0, 0, 41',
    description: '坚实可靠的灰色，传达着稳固与韧性',
    year: 2021
  },
  {
    color: '#FFDB58',
    name: 'Illuminating',
    zhName: '曜日黄',
    pinyin: 'yào rì huáng',
    rgb: '255, 219, 88',
    cmyk: '0, 14, 65, 0',
    description: '充满希望的明亮黄色，散发着温暖与乐观',
    year: 2021
  },
  {
    color: '#6667AB',
    name: 'Very Peri',
    zhName: '长春花蓝',
    pinyin: 'cháng chūn huā lán',
    rgb: '102, 103, 171',
    cmyk: '40, 40, 0, 33',
    description: '融合蓝色与紫罗兰的色调，象征着创新与想象',
    year: 2022
  },
  {
    color: '#BE3455',
    name: 'Viva Magenta',
    zhName: '洋红',
    pinyin: 'yáng hóng',
    rgb: '190, 52, 85',
    cmyk: '0, 73, 55, 25',
    description: '充满活力的洋红色，展现自然与数字世界的平衡',
    year: 2023
  },
  {
    color: '#FFBCC9',
    name: 'Peach Fuzz',
    zhName: '蜜桃粉',
    pinyin: 'mì táo fěn',
    rgb: '255, 188, 201',
    cmyk: '0, 26, 21, 0',
    description: '温柔的蜜桃色调，传达温暖与共情',
    year: 2024
  },
  {
    color: '#45B5AA',
    name: 'Turquoise',
    zhName: '绿松石',
    pinyin: 'lǜ sōng shí',
    rgb: '69, 181, 170',
    cmyk: '62, 0, 6, 29',
    description: '清新的绿松石色，象征着热带海洋的清澈',
    year: 2015
  },
  {
    color: '#955251',
    name: 'Marsala',
    zhName: '玛萨拉酒红',
    pinyin: 'mǎ sà lā jiǔ hóng',
    rgb: '149, 82, 81',
    cmyk: '0, 45, 46, 42',
    description: '浓郁的酒红色调，展现优雅与成熟',
    year: 2016
  },
  {
    color: '#88B04B',
    name: 'Greenery',
    zhName: '草木绿',
    pinyin: 'cǎo mù lǜ',
    rgb: '136, 176, 75',
    cmyk: '23, 0, 57, 31',
    description: '充满生机的草木绿，象征着新生与复苏',
    year: 2017
  }
];
