'use client';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Input } from '@/components/input';
import {
    Check,
    Copy,
    Globe,
    Link as LinkIcon,
    Lock,
    Mail,
    Share2,
    Users,
    X
} from 'lucide-react';
import { useState } from 'react';

interface BlueprintSharingProps {
    blueprintId: string;
    isPublic: boolean;
    shareToken: string;
    sharedWith: string[];
    onClose: () => void;
}

export default function BlueprintSharing({
    blueprintId,
    isPublic: initialIsPublic,
    shareToken,
    sharedWith: initialSharedWith,
    onClose
}: BlueprintSharingProps) {
    const [isPublic, setIsPublic] = useState(initialIsPublic);
    const [sharedWith, setSharedWith] = useState<string[]>(initialSharedWith || []);
    const [emailInput, setEmailInput] = useState('');
    const [copied, setCopied] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/blueprint/public/${shareToken}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(publicUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const togglePublic = async () => {
        setIsSharing(true);
        try {
            const response = await fetch(`/api/blueprint/${blueprintId}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ make_public: !isPublic })
            });

            if (!response.ok) throw new Error('Failed to update sharing');

            const data = await response.json();
            setIsPublic(!isPublic);
        } catch (error) {
            console.error('Error toggling public access:', error);
            alert('Failed to update sharing settings');
        } finally {
            setIsSharing(false);
        }
    };

    const shareWithUser = async () => {
        if (!emailInput.trim()) return;

        setIsSharing(true);
        try {
            const response = await fetch(`/api/blueprint/${blueprintId}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInput.trim() })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to share blueprint');
            }

            // Add to local state (in real app, would fetch user details)
            setSharedWith([...sharedWith, emailInput.trim()]);
            setEmailInput('');
        } catch (error: any) {
            console.error('Error sharing blueprint:', error);
            alert(error.message || 'Failed to share blueprint');
        } finally {
            setIsSharing(false);
        }
    };

    const removeSharing = async (userId: string) => {
        setIsSharing(true);
        try {
            const response = await fetch(
                `/api/blueprint/${blueprintId}/share?user_id=${userId}`,
                { method: 'DELETE' }
            );

            if (!response.ok) throw new Error('Failed to remove sharing');

            setSharedWith(sharedWith.filter(id => id !== userId));
        } catch (error) {
            console.error('Error removing sharing:', error);
            alert('Failed to remove sharing');
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        Share Blueprint
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Public Sharing */}
                    <Card className="p-4">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${isPublic ? 'bg-green-100' : 'bg-gray-100'}`}>
                                {isPublic ? (
                                    <Globe className="h-6 w-6 text-green-600" />
                                ) : (
                                    <Lock className="h-6 w-6 text-gray-600" />
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h3 className="font-bold">Public Access</h3>
                                        <p className="text-sm text-gray-600">
                                            {isPublic
                                                ? 'Anyone with the link can view this blueprint'
                                                : 'Only people you share with can access'
                                            }
                                        </p>
                                    </div>
                                    <Button
                                        variant={isPublic ? 'destructive' : 'default'}
                                        onClick={togglePublic}
                                        disabled={isSharing}
                                    >
                                        {isPublic ? 'Make Private' : 'Make Public'}
                                    </Button>
                                </div>

                                {isPublic && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <LinkIcon className="h-4 w-4 text-gray-600" />
                                            <span className="text-sm font-medium">Public Link</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                value={publicUrl}
                                                readOnly
                                                className="flex-1 font-mono text-sm"
                                            />
                                            <Button onClick={copyToClipboard} variant="outline">
                                                {copied ? (
                                                    <>
                                                        <Check className="h-4 w-4 mr-2" />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        Copy
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Share with Specific Users */}
                    <Card className="p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="h-5 w-5 text-indigo-600" />
                            <h3 className="font-bold">Share with Specific Users</h3>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <Input
                                type="email"
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                placeholder="Enter email address..."
                                onKeyPress={(e) => e.key === 'Enter' && shareWithUser()}
                            />
                            <Button
                                onClick={shareWithUser}
                                disabled={!emailInput.trim() || isSharing}
                            >
                                <Mail className="h-4 w-4 mr-2" />
                                Invite
                            </Button>
                        </div>

                        {sharedWith.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600 mb-2">
                                    Shared with {sharedWith.length} {sharedWith.length === 1 ? 'person' : 'people'}
                                </p>
                                {sharedWith.map((email, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                                <span className="text-indigo-600 font-bold text-sm">
                                                    {email[0].toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="text-sm">{email}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeSharing(email)}
                                            disabled={isSharing}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {sharedWith.length === 0 && (
                            <div className="text-center py-6 text-gray-500">
                                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">Not shared with anyone yet</p>
                            </div>
                        )}
                    </Card>

                    {/* Sharing Tips */}
                    <Card className="p-4 bg-blue-50 border-blue-200">
                        <h4 className="font-bold text-blue-900 mb-2">Sharing Tips</h4>
                        <ul className="space-y-1 text-sm text-blue-800">
                            <li>• Public links allow anyone to view the blueprint (read-only)</li>
                            <li>• Invited users can view and comment on the blueprint</li>
                            <li>• Only you can edit or delete the blueprint</li>
                            <li>• Shared users will receive an email notification</li>
                        </ul>
                    </Card>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button onClick={onClose}>Done</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}