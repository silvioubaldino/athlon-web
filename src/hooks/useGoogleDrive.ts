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
  const { driveToken } = useAuth()
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''

  const openPicker = useCallback(
    async (onSelectFolder: (folderId: string) => void) => {
      if (!apiKey || !driveToken) {
        toast.error('Token de acesso do Google ou Chave de API indisponível.')
        return
      }

      try {
        const loadPicker = () => {
          setIsPickerOpen(true)
          const view = new window.google.picker.DocsView()
            .setIncludeFolders(true)
            .setMimeTypes('application/vnd.google-apps.folder')
            .setSelectFolderEnabled(true)

          const picker = new window.google.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(driveToken)
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
    [apiKey, driveToken]
  )

  const fetchFilesInFolder = async (folderId: string): Promise<DriveFile[]> => {
    setIsLoadingFiles(true)
    try {
      if (!driveToken) throw new Error('Autenticação indisponível')

      // Load client library if not loaded
      if (!window.gapi.client) {
        await new Promise<void>((resolve) => {
          window.gapi.load('client', { callback: resolve })
        })
      }

      // We just use standard fetch instead of gapi.client to avoid initialization race conditions,
      // and because we already have the OAuth token.
      const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and mimeType contains 'image/'&fields=files(id, name, mimeType, webViewLink, thumbnailLink)&supportsAllDrives=true&includeItemsFromAllDrives=true`
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${driveToken}`,
        },
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error.message)

      return data.files as DriveFile[]
    } catch (err) {
      toast.error('Erro ao buscar arquivos da pasta')
      console.error(err)
      return []
    } finally {
      setIsLoadingFiles(false)
    }
  }

  return { openPicker, fetchFilesInFolder, isPickerOpen, isLoadingFiles }
}
