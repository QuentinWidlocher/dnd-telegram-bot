export declare type Spell = {
    name: string;
    originalName: string;
    castedBy: string[];
    id: string;
    level: number;
    school: string;
    isRitual: boolean;
    castingTime: string;
    range: string;
    components: string;
    duration: string;
    description: string;
    higherLevel?: string;
    usage?: number;
};
