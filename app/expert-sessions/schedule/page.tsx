'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
// import { Calendar } from '@/components/ui/calendar';
import { motion } from 'framer-motion';
import {
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    FileText,
    MessageCircle,
    Phone,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    User,
    Video
} from 'lucide-react';

interface Expert {
    id: string;
    name: string;
    title: string;
    specialties: string[];
    rating: number;
    sessions: number;
    availability: string[];
    imageUrl?: string;
}

interface TimeSlot {
    time: string;
    available: boolean;
}

export default function ExpertSessionsSchedule() {
    const [selectedExpert, setSelectedExpert] = useState<string>('1');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [sessionType, setSessionType] = useState<'strategy' | 'implementation' | 'troubleshooting'>('strategy');

    const experts: Expert[] = [
        {
            id: '1',
            name: 'Dr. Emily Rodriguez',
            title: 'Senior AI Strategy Consultant',
            specialties: ['Higher Ed AI Strategy', 'Change Management', 'Policy Development'],
            rating: 4.9,
            sessions: 234,
            availability: ['2025-10-15', '2025-10-17', '2025-10-22']
        },
        {
            id: '2',
            name: 'James Chen',
            title: 'AI Implementation Specialist',
            specialties: ['Technical Integration', 'EdTech', 'Data Analytics'],
            rating: 4.8,
            sessions: 189,
            availability: ['2025-10-16', '2025-10-18', '2025-10-23']
        }
    ];

    const timeSlots: TimeSlot[] = [
        { time: '9:00 AM', available: true },
        { time: '10:00 AM', available: false },
        { time: '11:00 AM', available: true },
        { time: '2:00 PM', available: true },
        { time: '3:00 PM', available: true },
        { time: '4:00 PM', available: false }
    ];

    const sessionTypes = [
        {
            type: 'strategy',
            title: 'Strategic Planning',
            description: 'Blueprint review, roadmap planning, goal setting',
            icon: Target,
            duration: '30 min'
        },
        {
            type: 'implementation',
            title: 'Implementation Support',
            description: 'Technical guidance, integration help, best practices',
            icon: TrendingUp,
            duration: '45 min'
        },
        {
            type: 'troubleshooting',
            title: 'Problem Solving',
            description: 'Address challenges, overcome barriers, quick solutions',
            icon: MessageCircle,
            duration: '30 min'
        }
    ];

    const handleBookSession = () => {
        if (!selectedDate || !selectedTime) return;

        // In production, this would call an API to book the session
        alert(`Session booked with ${experts.find(e => e.id === selectedExpert)?.name} on ${selectedDate.toDateString()} at ${selectedTime}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Phone className="h-8 w-8 text-indigo-600" />
                        <h1 className="text-3xl font-bold">Schedule Expert Session</h1>
                        <Badge className="bg-amber-100 text-amber-800">Premium</Badge>
                    </div>
                    <p className="text-gray-600">Book your monthly 1-on-1 strategy session with our AI experts</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Expert Selection */}
                    <div className="lg:col-span-1">
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4">Select Your Expert</h2>

                            <div className="space-y-4">
                                {experts.map((expert) => (
                                    <motion.div
                                        key={expert.id}
                                        whileHover={{ scale: 1.02 }}
                                        className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedExpert === expert.id
                                                ? 'border-indigo-600 bg-indigo-50'
                                                : 'hover:border-gray-300'
                                            }`}
                                        onClick={() => setSelectedExpert(expert.id)}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-semibold">{expert.name}</h3>
                                                <p className="text-sm text-gray-600">{expert.title}</p>
                                            </div>
                                            {selectedExpert === expert.id && (
                                                <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-1">
                                                {expert.specialties.map((specialty, idx) => (
                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                        {specialty}
                                                    </Badge>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 text-amber-500 fill-current" />
                                                    <span className="font-medium">{expert.rating}</span>
                                                </div>
                                                <span className="text-gray-500">{expert.sessions} sessions</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Session Type Selection */}
                            <h3 className="text-lg font-semibold mt-6 mb-3">Session Focus</h3>
                            <div className="space-y-3">
                                {sessionTypes.map((type) => (
                                    <div
                                        key={type.type}
                                        className={`border rounded-lg p-3 cursor-pointer transition-all ${sessionType === type.type
                                                ? 'border-indigo-600 bg-indigo-50'
                                                : 'hover:border-gray-300'
                                            }`}
                                        onClick={() => setSessionType(type.type as any)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <type.icon className="h-5 w-5 text-indigo-600 mt-0.5" />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium">{type.title}</h4>
                                                    <Badge variant="secondary">{type.duration}</Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Calendar and Time Selection */}
                    <div className="lg:col-span-2">
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4">Select Date & Time</h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Calendar */}
                                <div>
                                    <h3 className="font-medium mb-3 flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4" />
                                        Available Dates
                                    </h3>
                                    <div className="border rounded-lg p-4">
                                        <div className="grid grid-cols-7 gap-1 mb-2">
                                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                                <div key={day} className="text-center text-xs font-medium text-gray-600 p-2">
                                                    {day}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1">
                                            {/* Simple date grid for October 2025 */}
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                                                const isAvailable = [15, 16, 17, 18, 22, 23].includes(day);
                                                const isSelected = selectedDate?.getDate() === day;
                                                return (
                                                    <button
                                                        key={day}
                                                        onClick={() => {
                                                            const newDate = new Date(2025, 9, day); // October 2025
                                                            setSelectedDate(newDate);
                                                        }}
                                                        disabled={!isAvailable}
                                                        className={`
                              p-2 text-sm rounded-md transition-colors
                              ${isSelected
                                                                ? 'bg-indigo-600 text-white'
                                                                : isAvailable
                                                                    ? 'hover:bg-gray-100 cursor-pointer'
                                                                    : 'text-gray-300 cursor-not-allowed'
                                                            }
                            `}
                                                    >
                                                        {day}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Time Slots */}
                                <div>
                                    <h3 className="font-medium mb-3 flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Available Times
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {timeSlots.map((slot) => (
                                            <Button
                                                key={slot.time}
                                                variant={selectedTime === slot.time ? 'default' : 'outline'}
                                                disabled={!slot.available}
                                                onClick={() => slot.available && setSelectedTime(slot.time)}
                                                className="w-full"
                                            >
                                                {slot.time}
                                                {!slot.available && <span className="ml-2 text-xs">(Booked)</span>}
                                            </Button>
                                        ))}
                                    </div>

                                    {/* Session Details */}
                                    {selectedDate && selectedTime && (
                                        <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                                            <h4 className="font-semibold mb-2">Session Details</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-indigo-600" />
                                                    <span>{experts.find(e => e.id === selectedExpert)?.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="h-4 w-4 text-indigo-600" />
                                                    <span>{selectedDate.toDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-indigo-600" />
                                                    <span>{selectedTime}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Video className="h-4 w-4 text-indigo-600" />
                                                    <span>Video Conference (Zoom link will be sent)</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Preparation Tips */}
                            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-amber-600" />
                                    Maximize Your Session
                                </h4>
                                <ul className="space-y-1 text-sm text-gray-700">
                                    <li>• Review your latest AI trends report before the call</li>
                                    <li>• Prepare specific questions or challenges to discuss</li>
                                    <li>• Have your blueprint and progress metrics ready</li>
                                    <li>• Consider inviting key stakeholders to join</li>
                                </ul>
                            </div>

                            {/* Book Button */}
                            <div className="mt-6 flex justify-end gap-3">
                                <Button variant="outline">
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Past Sessions
                                </Button>
                                <Button
                                    onClick={handleBookSession}
                                    disabled={!selectedDate || !selectedTime}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Book Session
                                    <CheckCircle2 className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </Card>

                        {/* Recent Sessions */}
                        <Card className="p-6 mt-6">
                            <h3 className="text-lg font-bold mb-4">Your Recent Sessions</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">Strategic Planning Session</p>
                                        <p className="text-sm text-gray-600">with Dr. Emily Rodriguez • Sept 15, 2025</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline">Notes</Button>
                                        <Button size="sm" variant="outline">Recording</Button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">Implementation Review</p>
                                        <p className="text-sm text-gray-600">with James Chen • Aug 18, 2025</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline">Notes</Button>
                                        <Button size="sm" variant="outline">Recording</Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}