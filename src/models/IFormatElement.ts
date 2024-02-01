export interface IFormatElement {
    elmType?: string;
    txtContent?: string;
    children?: IFormatElement[];
    style?: any;
    attributes?: {
        href?: string;
        src?: string;
        class?: string;
        id?: string;
        target?: string;
        role?: string;
        d?: string;
        iconName?: string;
        rel?: string;
        title?: string;
        alt?: string;
        dataInterception?: string; // Fix hyphen problem
        viewBox?: string;
        preserveAspectRatio?: string;
        draggable?: string;
    },
    customAction?: {
        action: string;
        actionParams?: string;
        actionInput?: any;
    },
    forEach?: string;
    defaultHoverField?: string;
    customCardProps?: {
        openOnEvent: string;
        formatter: IFormatElement;
        directionalHint?: string;
        isBeakVisible?: boolean;
        beakStyle?: any;
    },
    columnFormatterReference?: string;
    inlineEditField?: string;
    filePreviewProps?: {
        fileTypeIconClass?: string;
        fileTypeIconStyle?: any;
        brandTypeIconClass?: string;
        brandTypeIconStyle?: any;
    }
}