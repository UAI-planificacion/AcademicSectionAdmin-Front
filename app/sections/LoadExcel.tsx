'use client'

import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { errorToast, successToast } from '@/config/toast/toast.config';
import { ENV } from '@/config/envs/env';

interface LoadExcelProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function LoadExcel({ onSuccess, onCancel }: LoadExcelProps) {
    const [isDragOver, setIsDragOver]           = useState( false );
    const [selectedFile, setSelectedFile]       = useState<File | null>( null );
    const [uploadStatus, setUploadStatus]       = useState<UploadStatus>( 'idle' );
    const [uploadProgress, setUploadProgress]   = useState( 0 );
    const [errorMessage, setErrorMessage]       = useState<string>( '' );

    const fileInputRef = useRef<HTMLInputElement>( null );

    const isExcelFile = ( file: File ): boolean => {
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
        ];

        const validExtensions = ['.xlsx', '.xls'];

        return validTypes.includes( file.type ) || validExtensions.some( ext => file.name.toLowerCase().endsWith( ext ) );
    };

    // Manejar selección de archivo
    const handleFileSelect = useCallback(( file: File ) => {
        if ( !isExcelFile( file )) {
            toast( 'Por favor selecciona un archivo Excel válido (.xlsx o .xls)', errorToast );
            return;
        }

        if ( file.size > 1024 * 1024 * 15 ) {
            toast( 'El archivo es demasiado grande. Máximo 15MB.', errorToast );
            return;
        }

        setSelectedFile( file );
        setUploadStatus( 'idle' );
        setErrorMessage( '' );
    }, []);

    // Manejar drag & drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, [handleFileSelect]);

    // Manejar click en botón de selección
    const handleButtonClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, [handleFileSelect]);

    // Subir archivo
    const handleUpload = useCallback(async () => {
        if ( !selectedFile ) {
            toast( 'Por favor selecciona un archivo primero.', errorToast );
            return;
        }

        setUploadStatus( 'uploading' );
        setUploadProgress( 0 );
        setErrorMessage( '' );

        try {
            const formData = new FormData();
            formData.append( 'file', selectedFile );

            const xhr = new XMLHttpRequest();
            
            // Manejar progreso de subida
            xhr.upload.onprogress = ( event ) => {
                if ( event.lengthComputable ) {
                    const progress = Math.round( ( event.loaded / event.total ) * 100 );
                    setUploadProgress( progress );
                }
            };

            // Manejar respuesta
            xhr.onload = () => {
                if ( xhr.status === 200 || xhr.status === 201 ) {
                    setUploadStatus( 'success' );
                    toast( 'Archivo Excel cargado exitosamente', successToast );

                    setTimeout( () => {
                        onSuccess?.();
                    }, 1500 );
                } else {
                    let errorMsg = 'Error al subir el archivo';
                    try {
                        const response = JSON.parse( xhr.responseText );
                        errorMsg = response.message || response.error || errorMsg;
                    } catch {
                        errorMsg = `Error ${xhr.status}: ${xhr.statusText}`;
                    }

                    setUploadStatus( 'error' );
                    setErrorMessage( errorMsg );
                    toast( errorMsg, errorToast );
                }
            };

            // Manejar errores de red
            xhr.onerror = () => {
                setUploadStatus( 'error' );
                setErrorMessage( 'Error de conexión. Verifica que el servidor esté funcionando.' );
                toast( 'Error de conexión con el servidor', errorToast );
            };

            // Enviar petición
            xhr.open( 'POST', `${ENV.REQUEST_BACK_URL}sections/upload-excel` );
            xhr.send( formData );
        } catch ( error ) {
            console.error( 'Error al subir archivo:', error );
            setUploadStatus( 'error' );
            setErrorMessage( 'Error inesperado al subir el archivo' );
            toast( 'Error inesperado al subir el archivo', errorToast );
        }
    }, [selectedFile, onSuccess]);

    // Limpiar selección
    const handleClearFile = useCallback(() => {
        setSelectedFile( null );
        setUploadStatus( 'idle' );
        setUploadProgress( 0 );
        setErrorMessage( '' );

        if ( fileInputRef.current ) {
            fileInputRef.current.value = '';
        }
    }, []);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Cargar Archivo Excel
                    </h2>

                    {onCancel && (
                        <button
                            onClick={ onCancel }
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            disabled={ uploadStatus === 'uploading' }
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Área de drag & drop */}
                <div
                    onDragOver  = { handleDragOver }
                    onDragLeave = { handleDragLeave }
                    onDrop      = { handleDrop }
                    className   = { cn(
                        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                        isDragOver
                            ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
                        uploadStatus === 'uploading' && "pointer-events-none opacity-50"
                    )}
                >
                    {uploadStatus === 'success' ? (
                        <div className="text-green-600 dark:text-green-400">
                            <CheckCircle className="h-12 w-12 mx-auto mb-4" />

                            <p className="text-lg font-medium">¡Archivo cargado exitosamente!</p>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                Las secciones han sido importadas correctamente.
                            </p>
                        </div>
                    ) : uploadStatus === 'error' ? (
                        <div className="text-red-600 dark:text-red-400">
                            <AlertCircle className="h-12 w-12 mx-auto mb-4" />

                            <p className="text-lg font-medium">Error al cargar archivo</p>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                {errorMessage}
                            </p>
                        </div>
                    ) : (
                        <>
                            {selectedFile ? (
                                <div className="space-y-4">
                                    <FileSpreadsheet className="h-12 w-12 mx-auto text-green-600 dark:text-green-400" />

                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {selectedFile.name}
                                        </p>

                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>

                                    {uploadStatus === 'uploading' && (
                                        <div className="space-y-2">
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                            </div>

                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Subiendo... {uploadProgress}%
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        Arrastra tu archivo Excel aquí
                                    </p>

                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        o haz clic en el botón para seleccionar
                                    </p>

                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                        Formatos soportados: .xlsx, .xls (máx. 10MB)
                                    </p>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Input oculto para selección de archivos */}
                <input
                    ref         = { fileInputRef }
                    type        = "file"
                    accept      = ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    onChange    = { handleFileInputChange }
                    className   = "hidden"
                />

                {/* Botones de acción */}
                <div className="flex gap-3 mt-6">
                    {uploadStatus === 'success' ? (
                        <button
                            onClick={onSuccess}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Continuar
                        </button>
                    ) : (
                        <>
                            {!selectedFile ? (
                                <button
                                    onClick={handleButtonClick}
                                    disabled={uploadStatus === 'uploading'}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Upload className="h-4 w-4" />
                                    Seleccionar Archivo
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleClearFile}
                                        disabled={uploadStatus === 'uploading'}
                                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium rounded-lg transition-colors"
                                    >
                                        Cambiar
                                    </button>

                                    <button
                                        onClick={handleUpload}
                                        disabled={uploadStatus === 'uploading'}
                                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        {uploadStatus === 'uploading' ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                Subiendo...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-4 w-4" />
                                                Subir Archivo
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Mensaje de error adicional */}
                {uploadStatus === 'error' && errorMessage && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-400">
                            {errorMessage}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
