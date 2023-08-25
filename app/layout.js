import 'semantic-ui-css/semantic.min.css'

import { Inter } from 'next/font/google'


const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Ishi-dev YT-Downloader',
    description: 'Download YouTube videos and musics with this App.'
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
            <link rel="icon" type="image/png" href="/fevicon.png" />
            </head>
            <body className={inter.className} style={{ backgroundColor: 'rgb(255, 255, 255)' }}>{children}</body>
        </html>
    )
}
