import React, { useState, useCallback } from 'react';
import { FileText, Upload, Download, X, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  conversionCategories, 
  getAllFormats, 
  getFormatById, 
  canConvertClientSide, 
  convertImageFile, 
  downloadFile 
} from '../../utils/fileConversions';

export function UniversalFileConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState<Blob | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [conversionStatus, setConversionStatus] = useState<'idle' | 'success' | 'error' | 'pending'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setConvertedFile(null);
    setConversionStatus('idle');
    setErrorMessage('');
    
    // Auto-select a target format based on file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const currentFormat = getAllFormats().find(f => f.extension === fileExtension);
    
    if (currentFormat) {
      // Suggest a different format in the same category
      const sameCategory = conversionCategories.find(c => c.id === currentFormat.category);
      if (sameCategory) {
        const otherFormat = sameCategory.formats.find(f => f.id !== currentFormat.id);
        if (otherFormat) {
          setTargetFormat(otherFormat.id);
        }
      }
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const getFileFormat = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return getAllFormats().find(f => f.extension === extension);
  };

  const convertFile = async () => {
    if (!selectedFile || !targetFormat) return;

    setIsConverting(true);
    setConversionStatus('pending');
    setErrorMessage('');

    try {
      const sourceFormat = getFileFormat(selectedFile);
      const targetFormatObj = getFormatById(targetFormat);

      if (!sourceFormat || !targetFormatObj) {
        throw new Error('Invalid file format');
      }

      if (canConvertClientSide(sourceFormat.id, targetFormat)) {
        // Client-side conversion
        if (sourceFormat.category === 'image' && targetFormatObj.category === 'image') {
          const convertedBlob = await convertImageFile(selectedFile, targetFormat);
          setConvertedFile(convertedBlob);
          setConversionStatus('success');
        } else if (sourceFormat.id === 'txt' && targetFormat === 'txt') {
          // Text file "conversion" (just copy)
          setConvertedFile(selectedFile);
          setConversionStatus('success');
        }
      } else {
        // Server-side conversion required
        setConversionStatus('error');
        setErrorMessage('Server-side conversion required. API integration pending for this format combination.');
      }
    } catch (error) {
      setConversionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Conversion failed');
    } finally {
      setIsConverting(false);
    }
  };

  const downloadConvertedFile = () => {
    if (!convertedFile || !selectedFile || !targetFormat) return;

    const targetFormatObj = getFormatById(targetFormat);
    if (!targetFormatObj) return;

    const originalName = selectedFile.name.split('.').slice(0, -1).join('.');
    const newFileName = `${originalName}.${targetFormatObj.extension}`;
    
    downloadFile(convertedFile, newFileName);
  };

  const reset = () => {
    setSelectedFile(null);
    setTargetFormat('');
    setConvertedFile(null);
    setConversionStatus('idle');
    setErrorMessage('');
  };

  const sourceFormat = selectedFile ? getFileFormat(selectedFile) : null;
  const targetFormatObj = getFormatById(targetFormat);
  const canConvert = sourceFormat && targetFormatObj && canConvertClientSide(sourceFormat.id, targetFormat);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="bg-emerald-100 p-4 rounded-full w-fit mx-auto mb-4">
          <FileText className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Universal File Converter</h1>
        <p className="text-gray-600">Convert between different file formats with ease</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragOver 
                ? 'border-emerald-400 bg-emerald-50' 
                : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Drop your file here
            </h3>
            <p className="text-gray-600 mb-6">
              Or click to browse and select a file to convert
            </p>
            <input
              type="file"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer transition-colors"
            >
              <Upload className="h-5 w-5" />
              <span>Choose File</span>
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selected File Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-emerald-600" />
                <div>
                  <div className="font-medium text-gray-900">{selectedFile.name}</div>
                  <div className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    {sourceFormat && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {sourceFormat.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={reset}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Convert to</label>
              <div className="space-y-4">
                {conversionCategories.map((category) => (
                  <div key={category.id}>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">{category.name}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {category.formats.map((format) => (
                        <button
                          key={format.id}
                          onClick={() => setTargetFormat(format.id)}
                          disabled={sourceFormat?.id === format.id}
                          className={`p-3 text-left rounded-lg border transition-colors ${
                            targetFormat === format.id
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : sourceFormat?.id === format.id
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                          }`}
                        >
                          <div className="font-medium text-sm">{format.name}</div>
                          <div className="text-xs text-gray-500">.{format.extension}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversion Status */}
            {targetFormat && (
              <div className="p-4 rounded-lg border">
                {!canConvert && conversionStatus === 'idle' && (
                  <div className="flex items-center space-x-2 text-orange-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">
                      This conversion requires server-side processing. API integration pending.
                    </span>
                  </div>
                )}
                
                {canConvert && conversionStatus === 'idle' && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm">
                      This conversion can be processed in your browser.
                    </span>
                  </div>
                )}

                {conversionStatus === 'success' && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm">Conversion completed successfully!</span>
                  </div>
                )}

                {conversionStatus === 'error' && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">{errorMessage}</span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!convertedFile ? (
                <button
                  onClick={convertFile}
                  disabled={!targetFormat || isConverting}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isConverting ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                  <span>{isConverting ? 'Converting...' : 'Convert File'}</span>
                </button>
              ) : (
                <button
                  onClick={downloadConvertedFile}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  <span>Download Converted File</span>
                </button>
              )}
              
              <button
                onClick={reset}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Choose Different File
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Supported Formats */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Formats</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {conversionCategories.map((category) => (
            <div key={category.id}>
              <h4 className="font-medium text-gray-900 mb-2">{category.name}</h4>
              <div className="space-y-1">
                {category.formats.map((format) => (
                  <div key={format.id} className="text-sm text-gray-600">
                    {format.name} (.{format.extension})
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Note:</strong> Image conversions are processed in your browser for privacy and speed. 
            Other format conversions require server-side processing and are currently in development.
          </div>
        </div>
      </div>
    </div>
  );
}