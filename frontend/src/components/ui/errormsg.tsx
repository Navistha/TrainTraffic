import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog.js';
import { Button } from './button.js';
import { useState } from 'react';

interface ErrorMsgProps {
  message: string;
}
export function ErrorMsg({ message }: ErrorMsgProps) {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Error</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {message}
                </div>
                <DialogFooter>
                    <Button onClick={() => setIsOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
