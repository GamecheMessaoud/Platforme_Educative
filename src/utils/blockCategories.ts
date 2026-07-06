export const blockCategoryColors: Record<string, string> = {
    motion: '#4C97FF',
    looks: '#9966FF',
    sound: '#CF63CF',
    events: '#FFBF00',
    control: '#FFAB19',
    sensing: '#5CB1D6',
    operators: '#59C059',
    variables: '#FF8C1A',
    'my blocks': '#FF6680',
};

const blockMap: Record<string, string> = {
    'انتقل': 'motion', 'تحرك': 'motion', 'استدر': 'motion', 'اذهب إلى': 'motion', 'انزلق': 'motion',
    'قل': 'looks', 'فكّر': 'looks', 'أظهر': 'looks', 'أخفِ': 'looks', 'غيّر المظهر': 'looks',
    'شغّل صوت': 'sound', 'عزف نغمة': 'sound', 'اضبط الصوت': 'sound',
    'عند النقر على العلم': 'events', 'عند الضغط على مفتاح': 'events', 'أرسل': 'events', 'عند التلقي': 'events',
    'كرّر': 'control', 'للأبد': 'control', 'إذا': 'control', 'إذا وإلا': 'control', 'انتظر': 'control',
    'أنشئ نسخة': 'control', 'احذف النسخة': 'control',
    'يلامس': 'sensing', 'مفتاح مضغوط': 'sensing', 'موضع الفأرة': 'sensing',
    'اضبط المتغير': 'variables', 'غيّر المتغير': 'variables', 'أضف للقائمة': 'variables',
};

export const getBlockCategory = (blockName: string): string =>
    blockMap[blockName] ?? 'motion';
