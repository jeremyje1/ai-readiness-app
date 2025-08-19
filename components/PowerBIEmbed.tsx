'use client'

import { useEffect, useRef } from 'react'

interface PowerBIEmbedProps {
  embedUrl: string
  accessToken?: string
  reportId: string
  groupId?: string
  height?: string
  width?: string
}

export default function PowerBIEmbed({
  embedUrl,
  accessToken,
  reportId,
  groupId,
  height = '600px',
  width = '100%'
}: PowerBIEmbedProps) {
  const embedRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Initialize Power BI embed
    const initEmbed = async () => {
      if (!embedRef.current) return

      try {
        // For now, show a placeholder - replace with actual Power BI embedding logic
        console.log('Power BI embed initialized:', { embedUrl, reportId, groupId })
      } catch (error) {
        console.error('Power BI embed failed:', error)
      }
    }

    initEmbed()
  }, [embedUrl, accessToken, reportId, groupId])

  return (
    <div className="power-bi-embed-container">
      <div 
        className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
        style={{ height, width }}
      >
        <div className="text-center p-8">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Power BI Dashboard</h3>
          <p className="text-gray-500 mb-4">
            Power BI integration placeholder
          </p>
          <div className="text-sm text-gray-400">
            Report ID: {reportId}
            {groupId && <div>Group ID: {groupId}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
