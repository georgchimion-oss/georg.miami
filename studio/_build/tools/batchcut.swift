import Foundation
import Vision
import CoreImage
import ImageIO
import UniformTypeIdentifiers
// usage: batchcut <framesDir> <outDir>   writes <name>.png RGBA cutouts (full frame size)
let a = CommandLine.arguments
let inDir = URL(fileURLWithPath: a[1]), outDir = URL(fileURLWithPath: a[2])
try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)
let files = try! FileManager.default.contentsOfDirectory(atPath: inDir.path).filter { $0.hasSuffix(".png") }.sorted()
let ctx = CIContext()
var fails = 0
for f in files {
  guard let ci = CIImage(contentsOf: inDir.appendingPathComponent(f)) else { fails += 1; continue }
  let h = VNImageRequestHandler(ciImage: ci, options: [:])
  let r = VNGenerateForegroundInstanceMaskRequest()
  do {
    try h.perform([r])
    guard let o = r.results?.first else { print("nofg \(f)"); fails += 1; continue }
    let pb = try o.generateMaskedImage(ofInstances: o.allInstances, from: h, croppedToInstancesExtent: false)
    let im = CIImage(cvPixelBuffer: pb)
    let cg = ctx.createCGImage(im, from: im.extent)!
    let d = CGImageDestinationCreateWithURL(outDir.appendingPathComponent(f) as CFURL, UTType.png.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(d, cg, nil); CGImageDestinationFinalize(d)
  } catch { print("err \(f) \(error)"); fails += 1 }
}
print("done \(files.count - fails)/\(files.count)")
