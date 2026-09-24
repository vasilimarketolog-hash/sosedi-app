// Dynamic Russian relative time formatting for posts, comments, and messages

export function formatRelativeTime(dateInput?: string | number | Date | null): string {
  if (!dateInput) return 'Только что';

  // If already relative text (e.g. legacy data like "25 минут назад", "Вчера в 14:20")
  if (typeof dateInput === 'string') {
    if (dateInput.includes('назад') || dateInput.includes('Вчера') || dateInput.includes('Только что')) {
      return dateInput;
    }
  }

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return String(dateInput);
  }

  const now = Date.now();
  const diffMs = now - date.getTime();

  // If date is slightly in future due to clock skew
  if (diffMs < 0) return 'Только что';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) {
    return 'Только что';
  }

  if (diffMin < 60) {
    const lastDigit = diffMin % 10;
    const lastTwo = diffMin % 100;
    let word = 'минут';
    if (lastTwo < 11 || lastTwo > 19) {
      if (lastDigit === 1) word = 'минуту';
      else if (lastDigit >= 2 && lastDigit <= 4) word = 'минуты';
    }
    return `${diffMin} ${word} назад`;
  }

  if (diffHours < 24) {
    const lastDigit = diffHours % 10;
    const lastTwo = diffHours % 100;
    let word = 'часов';
    if (lastTwo < 11 || lastTwo > 19) {
      if (lastDigit === 1) word = 'час';
      else if (lastDigit >= 2 && lastDigit <= 4) word = 'часа';
    }
    return `${diffHours} ${word} назад`;
  }

  if (diffDays === 1) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `Вчера в ${hours}:${minutes}`;
  }

  if (diffDays < 7) {
    const lastDigit = diffDays % 10;
    const lastTwo = diffDays % 100;
    let word = 'дней';
    if (lastTwo < 11 || lastTwo > 19) {
      if (lastDigit === 1) word = 'день';
      else if (lastDigit >= 2 && lastDigit <= 4) word = 'дня';
    }
    return `${diffDays} ${word} назад`;
  }

  const months = [
    'янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.',
    'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day} ${month} в ${hours}:${minutes}`;
}
