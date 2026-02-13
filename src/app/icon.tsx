import { ImageResponse } from 'next/og'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: '#0a0e17',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#3b82f6',
          borderRadius: '20%',
          border: '2px solid #1e2d3d',
          fontWeight: 900,
        }}
      >
        V
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
