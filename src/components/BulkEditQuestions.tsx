import React, { useState } from 'react'
import { EditOrCreateNewModalWrapper } from './EditOrCreateNewModalWrapper';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { bulkUpdateQuestions } from '@/redux/slices/library/question-bank/questionSlice';
import toast from 'react-hot-toast';
import SearchDropdown from './SearchDropdown';
import { fetchSkills } from '@/redux/slices/configuration/manage-subjects/skillsSlice';
import MultiTagSearchDropdown from './MultiTagSearchDropdown';
import { fetchTopics } from '@/redux/slices/configuration/manage-subjects/topicSlice';
import { fetchTags } from '@/redux/slices/configuration/manage-categories/tagsSlice';

interface BulkEditQuestionsProps {
    isVisible: boolean,
    onClose: () => void,
    selectedQuestions: string[],
    setSelectedQuestions: (value: any) => void
}

const BulkEditQuestions = ({ isVisible, onClose, selectedQuestions, setSelectedQuestions }: BulkEditQuestionsProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const [skillName, setSkillName] = useState<string>("")
    const [topicName, setTopicName] = useState<string>("")
    const [tagsName, setTagsName] = useState<string[]>([])
    const [isActive, setIsActive] = useState<boolean>(true)

    const handleApplyBulkEdit = async (updatedData: any) => {
        try {
            const response = await dispatch(bulkUpdateQuestions({ selectedQuestions, updatedData: { skillName, topicName, tagsName, isActive } }));
            if (response?.payload) {
                toast.success("Bulk edit applied successfully");
                onClose();
                setSelectedQuestions([]);
            }
        } catch (error) {
            toast.error("Failed to apply bulk edit");
        }
    };

    const handleTagSelect = (tags: any[]) => {
        setTagsName(tags); // Update the selected tags
    };

    const fetchAllActiveSkills = async (searchQuery: string, fetchAll: boolean) => {
        const response = await dispatch(fetchSkills({ name: searchQuery, fetchAll, isActive: true }));
        return response.payload.skills || [];
    }

    const fetchAllActiveTopic = async (searchQuery: string, fetchAll: boolean) => {
        const response = await dispatch(fetchTopics({ name: searchQuery, fetchAll, isActive: true }))
        return response.payload.topics || [];
    }

    const fetchAllActiveTags = async (searchQuery: string, fetchAll: boolean) => {
        const response = await dispatch(fetchTags({ name: searchQuery, fetchAll, isActive: true }))
        return response.payload.tags || [];
    }

    return (
        <div>
            <EditOrCreateNewModalWrapper isVisible={isVisible} onClose={onClose} onSave={handleApplyBulkEdit} title="Edit Questions" size="small" >

                {/* Skill Topic */}
                <SearchDropdown
                    label="Skill Name"
                    placeholder="Search for a skill..."
                    required={true}
                    fetchResults={fetchAllActiveSkills}
                    sectionName={skillName}
                    onSelect={(skill: any) => {
                        setSkillName(skill.name); // Set the selected section
                    }}
                />

                {/* topic */}
                <SearchDropdown
                    label="Topic Name"
                    placeholder="Search for a topic..."
                    required={false}
                    fetchResults={fetchAllActiveTopic}
                    sectionName={topicName}
                    onSelect={(topic: any) => {
                        setTopicName(topic.name); // Set the selected section
                    }}
                />

                {/* tags */}
                <MultiTagSearchDropdown
                    label="Select Tags"
                    placeholder="Select Tags"
                    fetchResults={fetchAllActiveTags}
                    onSelect={handleTagSelect}
                    required={false}
                    selectedTags={tagsName}
                />

                {/* Active/Inactive Toggle */}
                <div className="mt-4">
                    <div className='flex items-center' >
                        <label className="mr-2 text-sm font-semibold text-gray-700 dark:text-text_secondary"  >Status:</label>
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => setIsActive(!isActive)}
                            className="form-checkbox h-4 w-4 text-indigo-600 cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-text_secondary">
                            {isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                    <span className='text-xs dark:text-text_secondary'>
                        {isActive ? "(Shown Everywhere)" : "(Hidden Everywhere)"}
                    </span>
                </div>

            </EditOrCreateNewModalWrapper>
        </div>
    )
}

export default BulkEditQuestions
