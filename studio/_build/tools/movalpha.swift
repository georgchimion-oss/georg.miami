import AVFoundation
import CoreMedia
let url = URL(fileURLWithPath: CommandLine.arguments[1])
let asset = AVURLAsset(url: url)
let sem = DispatchSemaphore(value: 0)
Task {
  let track = try! await asset.loadTracks(withMediaType: .video).first!
  let fds = try! await track.load(.formatDescriptions)
  for fd in fds {
    let ext = CMFormatDescriptionGetExtensions(fd) as? [String: Any] ?? [:]
    print("codec:", CMFormatDescriptionGetMediaSubType(fd) == kCMVideoCodecType_HEVCWithAlpha ? "HEVCWithAlpha (muxa)" : String(CMFormatDescriptionGetMediaSubType(fd), radix: 16))
    print("ContainsAlphaChannel:", ext["ContainsAlphaChannel"] ?? "nil")
  }
  let reader = try! AVAssetReader(asset: asset)
  let out = AVAssetReaderTrackOutput(track: track, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
  reader.add(out); reader.startReading()
  if let sb = out.copyNextSampleBuffer(), let pb = CMSampleBufferGetImageBuffer(sb) {
    CVPixelBufferLockBaseAddress(pb, .readOnly)
    let w = CVPixelBufferGetWidth(pb), h = CVPixelBufferGetHeight(pb), bpr = CVPixelBufferGetBytesPerRow(pb)
    let base = CVPixelBufferGetBaseAddress(pb)!.assumingMemoryBound(to: UInt8.self)
    var clear = 0, solid = 0, mid = 0
    for y in 0..<h { for x in 0..<w { let a = base[y*bpr + x*4 + 3]; if a < 10 { clear += 1 } else if a > 245 { solid += 1 } else { mid += 1 } } }
    let n = Double(w*h)
    print(String(format: "frame0 %dx%d  transparent %.1f%%  opaque %.1f%%  edge %.1f%%", w, h, Double(clear)/n*100, Double(solid)/n*100, Double(mid)/n*100))
  }
  sem.signal()
}
sem.wait()
