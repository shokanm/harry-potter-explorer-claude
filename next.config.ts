import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Фотографии персонажей лежат на ImageKit. Пропуская их через оптимизатор
     * Next.js, мы получаем не только webp и нужные размеры: картинку скачивает
     * наш сервер, а браузер забирает её уже с нашего домена. Ни одного запроса
     * к чужому хосту из клиента — ровно как требует ТЗ.
     */
    remotePatterns: [{ protocol: "https", hostname: "ik.imagekit.io", pathname: "/hpapi/**" }],
    formats: ["image/webp"],
  },
};

export default nextConfig;
