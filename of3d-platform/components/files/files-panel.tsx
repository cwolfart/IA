"use client";

import { useAuth } from "@/components/auth-provider";
import { getProjectFiles, uploadFileRecord } from "@/lib/db/files";
import { uploadProjectFile } from "@/lib/storage";
import { ProjectFile } from "@/lib/types/schema";
import { cn } from "@/lib/utils";
import { FileIcon, FileText, Image as ImageIcon, Loader2, Upload, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface FilesPanelProps {
    projectId: string;
}

export function FilesPanel({ projectId }: FilesPanelProps) {
    const { user } = useAuth();
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadFiles();
    }, [projectId]);

    const loadFiles = async () => {
        const data = await getProjectFiles(projectId);
        setFiles(data);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length || !user) return;
        const file = e.target.files[0];
        setIsUploading(true);

        try {
            // 1. Upload to Storage
            const result = await uploadProjectFile(file, projectId);

            // 2. Create DB Record
            await uploadFileRecord({
                projectId,
                name: file.name,
                url: result.url,
                type: file.type.startsWith('image/') ? 'IMAGE' : 'DOCUMENT',
                size: file.size,
                uploadedBy: user.uid,
                version: 1 // Logic handled in DB function
            });

            // 3. Refresh list
            await loadFiles();
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const getIcon = (type: string) => {
        if (type === 'IMAGE') return <ImageIcon className="w-5 h-5 text-blue-400" />;
        if (type === 'CAD') return <FileIcon className="w-5 h-5 text-orange-400" />;
        return <FileText className="w-5 h-5 text-gray-400" />;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Upload Area */}
            <div className="p-4 border-b border-white/10">
                <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed border-white/10 rounded-xl bg-white/5 p-6 cursor-pointer hover:bg-white/10 transition-all flex flex-col items-center gap-2 text-center",
                        isUploading && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleUpload}
                    />
                    {isUploading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                    ) : (
                        <Upload className="w-6 h-6 text-muted-foreground" />
                    )}
                    <p className="text-sm font-medium text-white">
                        {isUploading ? "Uploading..." : "Upload File"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Drag & drop or click to browse
                    </p>
                </div>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {files.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-8">
                        No files uploaded yet.
                    </div>
                )}
                {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center flex-shrink-0">
                                {getIcon(file.type)}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>v{file.version}</span>
                                    <span>•</span>
                                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    <span>•</span>
                                    <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-muted-foreground hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Download className="w-4 h-4" />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
