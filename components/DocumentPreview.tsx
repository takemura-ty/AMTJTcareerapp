import { useEffect, useRef, useState } from 'react'

type DocumentPreviewProps = {
  src: string
  title: string
}

export default function DocumentPreview({ src, title }: DocumentPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isCancelled = false
    let cancelLoading: (() => void) | undefined

    async function renderFirstPage() {
      setHasError(false)

      try {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf')
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

        const loadingTask = pdfjs.getDocument(src)
        cancelLoading = () => loadingTask.destroy()
        const document = await loadingTask.promise
        const page = await document.getPage(1)
        const viewport = page.getViewport({ scale: window.devicePixelRatio || 1 })
        const canvas = canvasRef.current

        if (isCancelled || !canvas) return

        const context = canvas.getContext('2d')
        if (!context) return

        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        await page.render({ canvasContext: context, viewport }).promise
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to render PDF preview', error)
          setHasError(true)
        }
      }
    }

    renderFirstPage()

    return () => {
      isCancelled = true
      cancelLoading?.()
    }
  }, [src])

  if (hasError) {
    return <a className="document-preview-error" href={src} target="_blank" rel="noreferrer">資料を開く</a>
  }

  return <canvas ref={canvasRef} className="document-preview" aria-label={title} />
}