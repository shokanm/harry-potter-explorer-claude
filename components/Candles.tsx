/**
 * Парящие свечи Большого зала.
 *
 * Позиции заданы вручную, а не случайно: случайные значения разъезжались бы
 * между серверным и клиентским рендером и ломали гидратацию.
 *
 * Свечи живут только в боковых полях и только на широких экранах. На узких
 * колонка текста занимает всю ширину, и атмосферная деталь начала бы лезть
 * на буквы — а украшение, мешающее читать, перестаёт быть украшением.
 */
const CANDLES = [
  { left: "2.5%", top: "18%", height: 44, delay: "0s", duration: "11s" },
  { left: "5.5%", top: "47%", height: 28, delay: "2.4s", duration: "13s" },
  { left: "3%", top: "74%", height: 34, delay: "4.1s", duration: "12s" },
  { left: "96%", top: "13%", height: 38, delay: "1.2s", duration: "12.5s" },
  { left: "93.5%", top: "41%", height: 26, delay: "3.3s", duration: "10.5s" },
  { left: "96.5%", top: "68%", height: 32, delay: "5s", duration: "14s" },
];

export function Candles() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden xl:block">
      {CANDLES.map((candle, index) => (
        <span
          key={index}
          className="candle"
          style={{
            left: candle.left,
            top: candle.top,
            height: candle.height,
            animationDelay: candle.delay,
            animationDuration: candle.duration,
          }}
        />
      ))}
    </div>
  );
}
