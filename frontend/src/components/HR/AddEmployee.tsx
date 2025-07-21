import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AddEmployee = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [hireDate, setHireDate] = useState('');

  const handleSubmit = () => {
    const newEmployee = { name, position, department, email, hireDate };
    onAdd(newEmployee);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4">
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Position" value={position} onChange={(e) => setPosition(e.target.value)} />
        <Input placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="date" placeholder="Hire Date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} />
          <Button onClick={handleSubmit}>Add Employee</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployee;
