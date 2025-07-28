"use client"

import { useState } from "react"

const DebugPanel = ({ recipe }) => {
  const [showDebug, setShowDebug] = useState(false)

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button onClick={() => setShowDebug(!showDebug)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs">
        Debug
      </button>

      {showDebug && (
        <div className="absolute bottom-8 right-0 bg-white border rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-auto">
          <h3 className="font-bold mb-2">Recipe Debug Info</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">{JSON.stringify(recipe, null, 2)}</pre>

          <div className="mt-4">
            <h4 className="font-semibold">API Test Buttons:</h4>
            <div className="flex gap-2 mt-2">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`http://127.0.0.1:8000/api/likes/posts/${recipe.id}/like/`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                    })
                    const data = await response.json()
                    console.log("Like API Response:", data)
                    alert("Check console for like response")
                  } catch (error) {
                    console.error("Like API Error:", error)
                    alert("Like API Error - check console")
                  }
                }}
                className="bg-red-500 text-white px-2 py-1 rounded text-xs"
              >
                Test Like API
              </button>

              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`http://127.0.0.1:8000/api/comments/posts/${recipe.id}/comments/`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ content: "Test comment" }),
                    })
                    const data = await response.json()
                    console.log("Comment API Response:", data)
                    alert("Check console for comment response")
                  } catch (error) {
                    console.error("Comment API Error:", error)
                    alert("Comment API Error - check console")
                  }
                }}
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
              >
                Test Comment API
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DebugPanel
