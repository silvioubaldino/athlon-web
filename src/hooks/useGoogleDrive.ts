import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

declare global {
  interface Window {
    google: any
    gapi: any
  }
}

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink: string
  thumbnailLink: string
}

export function useGoogleDrive() {
  const { driveToken, signInWithGoogle } = useAuth()
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''

  const openPicker = useCallback(
    async (onSelectFolder: (folderId: string) => void) => {
      if (!apiKey) {
        toast.error('Chave de API indisponível.')
        return
      }

      let currentToken = driveToken

      // Validate token before opening picker
      if (currentToken) {
        try {
          const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${currentToken}`)
          if (!res.ok) {
            currentToken = null // Forces re-auth below
          }
        } catch (e) {
          // ignore network errors for validation, let it try
        }
      }

      if (!currentToken) {
        toast.info('Autenticando com o Google Drive...')
        try {
          await signInWithGoogle()
          currentToken = localStorage.getItem('drive_token')
          if (!currentToken) return
        } catch (e) {
          toast.error('Acesso ao Google Drive cancelado ou falhou.')
          return
        }
      }

      try {
        const loadPicker = () => {
          setIsPickerOpen(true)
          const view = new window.google.picker.DocsView(window.google.picker.ViewId.FOLDERS)
            .setIncludeFolders(true)
            .setMimeTypes('application/vnd.google-apps.folder')
            .setSelectFolderEnabled(true)
            .setParent('root')

          const picker = new window.google.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(currentToken)
            .setDeveloperKey(apiKey)
            .setCallback((data: any) => {
              if (data.action === window.google.picker.Action.PICKED) {
                const doc = data.docs[0]
                onSelectFolder(doc.id)
                setIsPickerOpen(false)
              } else if (data.action === window.google.picker.Action.CANCEL) {
                setIsPickerOpen(false)
              }
            })
            .build()
          picker.setVisible(true)
        }

        if (window.gapi && window.gapi.load) {
          window.gapi.load('picker', { callback: loadPicker })
        } else {
          toast.error('Google API não carregada')
        }
      } catch (err) {
        toast.error('Erro ao abrir o Picker com o Google')
        console.error(err)
      }
    },
    [apiKey, driveToken, signInWithGoogle]
  )

  const fetchFilesInFolder = async (folderId: string): Promise<DriveFile[]> => {
    setIsLoadingFiles(true)
    try {
      const tokenToUse = localStorage.getItem('drive_token') || driveToken
      if (!tokenToUse) throw new Error('Autenticação indisponível')

      // Load client library if not loaded
      if (!window.gapi.client) {
        await new Promise<void>((resolve) => {
          window.gapi.load('client', { callback: resolve })
        })
      }

      const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and mimeType contains 'image/'&fields=files(id, name, mimeType, webViewLink, thumbnailLink)&supportsAllDrives=true&includeItemsFromAllDrives=true`
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
        },
      })

      const data = await response.json()
      if (data.error && data.error.code === 401) {
        toast.error('Sua sessão do Google Drive expirou. Por favor, importe o diretório novamente.')
        throw new Error(data.error.message)
      } else if (data.error) {
        throw new Error(data.error.message)
      }

      return data.files as DriveFile[]
    } catch (err: any) {
      if (err.message !== 'Autenticação indisponível' && !err.message.includes('Sua sessão')) {
         toast.error('Erro ao buscar arquivos da pasta')
      }
      console.error(err)
      return []
    } finally {
      setIsLoadingFiles(false)
    }
  }

  return { openPicker, fetchFilesInFolder, isPickerOpen, isLoadingFiles }
}
