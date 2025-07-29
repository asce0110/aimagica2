"use client"

import React from "react"
import { ImageIcon, Brush, X, CheckCircle } from "lucide-react"
import { useGenerationStore } from "@/lib/stores/generation-store"
import SketchCanvas from "@/components/sketch-canvas"

export default function ImageUploadSection() {
  const { 
    creationMode, 
    uploadedImage, 
    setUploadedImage, 
    showDrawing, 
    setShowDrawing 
  } = useGenerationStore()

  // 只在图片模式下显示
  if (creationMode !== "img2img" && creationMode !== "img2video") {
    return null
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleStartDrawing = () => {
    console.log('🎨 Starting drawing mode with existing image:', !!uploadedImage)
    setShowDrawing(true)
  }

  const handleSubmitDrawing = (imageData: string) => {
    setUploadedImage(imageData)
    setShowDrawing(false)
  }

  const handleManualSave = () => {
    // 手动触发保存
    const canvas = document.querySelector('canvas') as HTMLCanvasElement
    if (canvas) {
      const imageData = canvas.toDataURL("image/png")
      handleSubmitDrawing(imageData)
      console.log('🎨 Manual save triggered from external button')
    }
  }

  return (
    <div>
      <h3
        className="text-[#2d3e2d] font-black text-lg mb-4 transform rotate-1"
        style={{
          fontFamily: "Fredoka One, Arial Black, sans-serif",
          textShadow: "1px 1px 0px #d4a574",
        }}
      >
        Upload or Draw Your Image! 📸🎨
      </h3>
      
      {/* Show uploaded image or drawing */}
      {uploadedImage && !showDrawing ? (
        <div className="border-2 border-dashed border-[#8b7355] rounded-xl p-6 text-center bg-[#f5f1e8]">
          <div className="relative">
            <img
              src={uploadedImage}
              alt="Uploaded or drawn image"
              className="max-h-[200px] mx-auto rounded-lg shadow-lg border-2 border-[#8b7355]"
            />
            <button
              onClick={() => setUploadedImage(null)}
              className="absolute -top-2 -right-2 bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] rounded-full w-8 h-8 flex items-center justify-center font-bold"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              <X className="w-4 h-4" />
            </button>
            <div className="mt-3 flex gap-2 justify-center">
              <label className="bg-white border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#d4a574] font-bold px-4 py-2 rounded-xl cursor-pointer transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <ImageIcon className="w-4 h-4 mr-1 inline" />
                Upload New
              </label>
              <button
                onClick={handleStartDrawing}
                className="bg-white border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#d4a574] font-bold px-4 py-2 rounded-xl transition-all"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <Brush className="w-4 h-4 mr-1 inline" />
                Edit Image
              </button>
            </div>
          </div>
        </div>
      ) : showDrawing ? (
        /* Image Editing Canvas */
        <div className="border-2 border-dashed border-[#8b7355] rounded-xl p-6 bg-[#f5f1e8]">
          <div className="text-center mb-4">
            <h4 className="text-[#2d3e2d] font-bold text-lg mb-2" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
              🖼️ Edit Your Image!
            </h4>
            <p className="text-[#8b7355] font-bold text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
              Draw modifications on your image - AI will enhance the changes!
            </p>
          </div>
          <div className="bg-white rounded-lg border-2 border-[#8b7355] overflow-hidden">
            <SketchCanvas 
              onSubmitDrawing={handleSubmitDrawing} 
              baseImage={uploadedImage}
              mode="edit"
            />
          </div>
          <div className="mt-4 text-center">
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowDrawing(false)}
                className="bg-white border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#8b7355] hover:text-[#f5f1e8] font-bold px-6 py-3 rounded-xl transition-all transform hover:scale-105"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={handleManualSave}
                className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-bold px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg animate-pulse"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <CheckCircle className="w-4 h-4 mr-2 inline" />
                Save Changes! ✨
              </button>
            </div>
            <p className="text-[#8b7355] text-sm mt-2 font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
              💡 Tip: You can also use the "Apply Changes!" button on the canvas
            </p>
          </div>
        </div>
      ) : (
        /* Upload or Draw options */
        <div className="border-2 border-dashed border-[#8b7355] rounded-xl p-6 text-center bg-[#f5f1e8]">
          <div className="py-8">
            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-[#8b7355] mx-auto mb-2" />
                <p className="text-[#8b7355] font-bold text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  Upload Image
                </p>
              </div>
              <div className="text-[#8b7355] text-2xl flex items-center">OR</div>
              <div className="text-center">
                <Brush className="w-12 h-12 text-[#8b7355] mx-auto mb-2" />
                <p className="text-[#8b7355] font-bold text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  Edit Image
                </p>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <label className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-bold px-6 py-3 rounded-xl cursor-pointer transition-all transform hover:scale-105 border-2 border-[#2d3e2d]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <ImageIcon className="w-5 h-5 mr-2 inline" />
                Choose File
              </label>
              <button
                onClick={handleStartDrawing}
                disabled={!uploadedImage}
                className={`font-bold px-6 py-3 rounded-xl transition-all transform border-2 border-[#2d3e2d] ${
                  uploadedImage 
                    ? "bg-[#8b7355] hover:bg-[#6d5a42] text-[#f5f1e8] hover:scale-105" 
                    : "bg-[#8b7355]/30 text-[#8b7355] cursor-not-allowed"
                }`}
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <Brush className="w-5 h-5 mr-2 inline" />
                {uploadedImage ? "Start Editing" : "Upload Image First"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}