export const ConfirmationDialogMessages = {
    inventoryManagement: {
        removeConfirmation: {
            title: 'Ignore inventory',
            description: 'Are you sure you want to ignore this inventory?',
            buttons: {
                cancel: 'Cancel',
                remove: 'Ignore',
            },
        },
    },
    userManagement: {
        deleteRole: {
            title: 'Delete Role',
            description: 'Are you sure you want to delete this role?',
            buttons: {
                cancel: 'Cancel',
                delete: 'Delete',
            },
        },
    },
    tourDispatch: {
        overbook: {
            title: 'Save Booking',
            description:
                'You have exceeded the maximum number of seats available on this departure.  Are you sure you want to continue?',
            buttons: {
                cancel: 'Cancel',
                continue: 'Continue',
            },
        },
    },
    general: {
        unsavedChanges: {
            title: 'You have unsaved changes',
            description:
                'Are you sure you want to leave this page? Changes you made will not be saved.',
            buttons: {
                cancel: 'Cancel',
                leave: 'Leave',
            },
        },
    },
    agent: {
        manageBooking: {
            cancelOrder: {
                title: 'Are you sure you want to cancel the order?',
                description:
                    'All seats will be released and rebooking is Not guaranteed',
                buttons: {
                    backToBooking: 'Back to Booking',
                    cancelOrderAnyways: 'Cancel Order Anyways',
                },
            },
            modifyBooking: {
                title: 'Are you sure you want to modify the order?',
                description: '',
                buttons: {
                    backToBooking: 'Back to Booking',
                    saveOrder: 'Save Order',
                },
            },
            removeTour: {
                title: 'Are you sure you want to remove this tour?',
                description:
                    'All seats will be released and rebooking is Not guaranteed',
                buttons: {
                    backToBooking: 'Back to Booking',
                    removeTour: 'Remove Tour',
                },
            },
        },
        profile: {
            updateProfile: {
                title: 'Are you sure you want to update your profile?',
                description:
                    'Once you update your profile, you will lose the older information.',
                buttons: {
                    cancel: 'Cancel',
                    saveChanges: 'Save Changes',
                },
            },
            removeUser: {
                title: 'Are you sure you want to remove this user?',
                description:
                    'Once the agent is removed, you will have to add them back to see them in this list again.',
                buttons: {
                    cancel: 'Cancel',
                    removeUser: 'Remove User',
                },
            },
            reaactivateUser: {
                title: 'Are you sure you want to reactivate this user?',
                description: '',
                buttons: {
                    cancel: 'Cancel',
                    removeUser: 'Reactivate User',
                },
            },
        },
    },
};

export const ErrorDialogMessages = {
    inventoryManagement: {
        allocationNotFound: {
            title: 'Could not find allocation',
            description:
                'We could not find the allocation you were looking for.',
            buttons: {
                close: 'Return to previous page',
            },
        },
        allocateAndReleaseError: {
            title: 'Could not allocate and release selected inventory',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        recentlyReleasedSendEmailError: {
            title: 'Could not send notification for selected inventory',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        recentlyReleasedDismissError: {
            title: 'Could not dismiss selected inventory',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        recentlyReleasedLoadError: {
            title: 'Could not load inventory',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        fileHeaderReportLoadError: {
            title: 'Could not load file header reports',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        fileHeaderReportEditError: {
            title: 'Could not edit file header report',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        fileHeaderReportDeleteError: {
            title: 'Could not delete selected file header report',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        shipReportLoadError: {
            title: 'Could not load ship reports',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        shipReportEditError: {
            title: 'Could not edit ship report',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        shipReportDeleteError: {
            title: 'Could not delete selected ship report',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        tourReportLoadError: {
            title: 'Could not load tour reports',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        tourReportEditError: {
            title: 'Could not edit tour report',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        tourReportDeleteError: {
            title: 'Could not delete tour report',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        portReportLoadError: {
            title: 'Could not load port reports',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        portReportEditError: {
            title: 'Could not edit port report',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        portReportDeleteError: {
            title: 'Could not delete port report',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        salesDataUploadError: {
            title: 'Could not upload sales data',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
    },
    userManagement: {
        qualificationNotFound: {
            title: 'Could not find qualification',
            description:
                'We could not find the qualification you were looking for.',
            buttons: {
                close: 'Close',
            },
        },
        qualificationDeleteError: {
            title: 'Could not delete selected qualification',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        evaluationNotFound: {
            title: 'Could not find evaluation',
            description:
                'We could not find the evaluation you were looking for.',
            buttons: {
                close: 'Close',
            },
        },
        evaluationEditError: {
            title: 'Could not edit selected evaluation',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        evaluationDeleteError: {
            title: 'Could not delete selected evaluation',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        housingLoadError: {
            title: 'Could not find housing data',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        housingEditError: {
            title: 'Could not edit selected housing data',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        licenseLoadError: {
            title: 'Could not find license',
            description: 'We could not find the license you were looking for.',
            buttons: {
                close: 'Close',
            },
        },
        licenseEditError: {
            title: 'Could not edit selected license',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        licenseDeleteError: {
            title: 'Could not delete selected license',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        noteLoadError: {
            title: 'Could not find note',
            description: 'We could not find the note you were looking for.',
            buttons: {
                close: 'Close',
            },
        },
        noteEditError: {
            title: 'Could not edit selected note',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        noteDeleteError: {
            title: 'Could not delete selected note',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        trainingLoadError: {
            title: 'Could not find training',
            description: 'We could not find the training you were looking for.',
            buttons: {
                close: 'Close',
            },
        },
        trainingEditError: {
            title: 'Could not edit selected training',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        trainingDeleteError: {
            title: 'Could not delete selected training',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        certificationDeleteError: {
            title: 'Could not delete selected certification',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        saveUserDetailError: {
            title: 'Could not save user details',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        saveUserPhotoError: {
            title: 'Could not save user profile photo',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        resetPasswordError: {
            title: 'Could not reset user password',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        addNewUserError: {
            title: 'Could not add new user',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        loadUserError: {
            title: 'Could not load user',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        updateFeature: {
            title: 'Failed to update feature permissions',
            description: '',
            buttons: {
                close: 'Close',
            },
        },
        updatePage: {
            title: 'Failed to update page permissions',
            description: '',
            buttons: {
                close: 'Close',
            },
        },
        updatePageFeature: {
            title: 'Failed to update page feature permissions',
            description: '',
            buttons: {
                close: 'Close',
            },
        },
        fetchFeatureFlags: {
            title: 'Failed to fetch feature flags',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
        deleteRole: {
            title: 'Failed to delete role',
            description: 'Something went wrong, please try again later.',
            buttons: {
                close: 'Close',
            },
        },
    },
    agent: {
        profile: {
            editIncompleteProfile: {
                title: 'Incomplete profile',
                description: 'Please fill out all required fields.',
                buttons: {
                    close: 'Close',
                },
            },
            updateProfileError: {
                title: 'Unable to update profile',
                description: 'Something went wrong, please try again later.',
                buttons: {
                    close: 'Close',
                },
            },
            addAgentCompanyUser: {
                title: 'Unable to add user',
                description: 'Something went wrong, please try again later.',
                buttons: {
                    close: 'Close',
                },
            },
            getAgentProfile: {
                title: 'Unable to get user',
                description: 'Something went wrong, please try again later.',
                buttons: {
                    close: 'Close',
                },
            },
            getAgentMappedUsersList: {
                title: 'Unable to get mapped users list',
                description: 'Something went wrong, please try again later.',
                buttons: {
                    close: 'Close',
                },
            },
            deleteAgentMappedUser: {
                title: 'Unable to delete mapped user',
                description: 'Something went wrong, please try again later.',
                buttons: {
                    close: 'Close',
                },
            },
            setUserAgentMappingActive: {
                title: 'Unable to set mapped user active',
                description: 'Something went wrong, please try again later.',
                buttons: {
                    close: 'Close',
                },
            },
        },
        manageBooking: {
            loadBookingError: {
                title: 'Failed to load booking',
                description: 'Something went wrong, please try again later.',
                buttons: {
                    close: 'Close',
                },
            },
            modifyBooking: {
                title: 'Failed to modify booking',
                description: 'Something went wrong, please try again later.',
                buttons: {
                    close: 'Close',
                },
            },
            modifyBookingIncompleteForm: {
                title: 'Missing Information',
                description: 'Please fill out all required fields.',
                buttons: {
                    close: 'Close',
                },
            },
            modifyBookingVoidEligible: {
                title: 'Failed to modify booking',
                description:
                    'This booking cannot be modified online. Please contact our staff to modify the booking.',
                buttons: {
                    close: 'Close',
                },
            },
            cancelBooking: {
                title: 'Failed to cancel booking',
                description: 'Something went wrong, please try again later.',
                buttons: {
                    close: 'Close',
                },
            },
            errorEmailSend: {
                title: 'Error resending Email',
                description: '',
                buttons: {
                    close: 'Close',
                },
            },
            priceChange: {
                title: 'Unable to update booking',
                description:
                    'We are sorry.  At least one item in this order has a new price.  You may not increase the number of participants on this booking: please make a new booking to accommodate the additional guests needed.',
                buttons: {
                    close: 'Close',
                },
            },
            calculateEstimatedRefundAmount: {
                title: 'Failed to calculate estimated refund amount',
                description: 'Something went wrong, please try again later.',
                buttons: {
                    close: 'Close',
                },
            },
            getAgentBookingList: {
                title: 'Failed to get agent booking list',
                description: 'Something went wrong, please try again later.',
                buttons: {
                    close: 'Close',
                },
            },
            submitUpdateBookingWithCreditCardInfo: {
                title: 'Failed to update booking with credit card info',
                description: 'Something went wrong, please try again later.',
                buttons: {
                    close: 'Close',
                },
            },
        },
        dashboard: {
            loadDashboardData: {
                title: 'Failed to load dashboard data',
                description: 'Something went wrong, please try again later.',
                buttons: {
                    close: 'Close',
                },
            },
        },
        statements: {
            getStatementList: {
                title: 'Failed to get statement list',
                description: 'Something went wrong, please try again later.',
                buttons: {
                    close: 'Close',
                },
            },
            getStatementDetail: {
                title: 'Failed to get statement detail',
                description: 'Something went wrong, please try again later.',
                buttons: {
                    close: 'Close',
                },
            },
        },
    },
    public: {
        excursion: {
            excursionNotFound: {
                title: 'Tour not found',
                description:
                    "We're unable to find the data you're looking for.",
                buttons: {
                    close: 'Close',
                },
            },
        },
        cart: {
            incompleteLeadTraveler: {
                title: 'Missing Information',
                description:
                    'Enter lead traveler information to continue to checkout',
                buttons: {
                    backToCart: 'Close',
                },
            },
            invalidParticipants: {
                title: 'Missing Information',
                description:
                    'At least one booking contains no participants. Remove the booking or add a participant to update the booking.',
                buttons: {
                    backToCart: 'Close',
                },
            },
            participantsExceedSeatsAvailable: {
                title: 'Invalid Information',
                description:
                    'At least one booking contains an invalid number of participants. Update the participant count to update the booking.',
                buttons: {
                    backToCart: 'Close',
                },
            },
        },
        checkout: {
            incompleteForm: {
                title: 'Missing Information',
                description:
                    'Fill out all required fields to complete your booking',
                buttons: {
                    close: 'Close',
                },
            },
            // when users navigate to checkout with an empty cart
            // this error message will be displayed and the user will
            // be redirected to the search page
            cartIsEmpty: {
                title: 'Empty Cart',
                description: "You haven't added any tours to your cart",
                buttons: {
                    backToShopping: 'Back to Shopping',
                },
            },
            // when users navigate to checkout with an invalid cart
            // this error message will be displayed and the user will
            // be redirected to the cart page
            incompleteLeadTraveler: {
                title: 'Missing Information',
                description:
                    'Enter lead traveler information to continue to checkout',
                buttons: {
                    backToCart: 'Back to Cart',
                },
            },
            invalidParticipants: {
                title: 'Missing Information',
                description:
                    'At least one booking contains no participants. Remove the booking or add a participant to continue to checkout',
                buttons: {
                    backToCart: 'Back to Cart',
                },
            },

            saveBookingError: {
                title: 'Unable to submit booking',
                description: 'Please try again later.',
                buttons: {
                    close: 'Close',
                },
            },
            retrieveTicketCreateAccountFail: {
                title: 'Unable to create account',
                description: 'Your booking is saved',
                buttons: {
                    close: 'Close',
                },
            },
            retrieveTicketFail: {
                title: 'Unable to retrieve tickets',
                description: 'Something went wrong, please try again later.',
                buttons: {
                    close: 'Close',
                },
            },
        },
        bookingConfirmation: {
            resendEmailError: {
                title: 'Unable to resend email',
                description: 'Please try again later.',
                buttons: {
                    close: 'Close',
                },
            },
            bookingNotFound: {
                title: 'Booking not found',
                description:
                    "We're unable to find the data you're looking for.",
                buttons: {
                    close: 'Close',
                },
            },
        },
        search: {
            getCruiseItineraries: {
                title: 'Failed to get cruise iTineraries',
                description: 'Something went wrong, please try again later.',
                buttons: {
                    close: 'Close',
                },
            },
        },
    },
};

export const SuccessDialogMessages = {
    inventoryManagement: {
        allocateAndReleaseSuccess: {
            title: 'Inventory Allocated and Released',
            description: '',
            buttons: {
                close: 'Close',
            },
        },
        recentlyReleasedSendEmailError: {
            title: 'Inventory Notification Sent',
            description: '',
            buttons: {
                close: 'Close',
            },
        },
        recentlyReleasedDismissError: {
            title: 'Inventory Dismissed',
            description: '',
            buttons: {
                close: 'Close',
            },
        },
    },
    public: {
        checkout: {
            bookingConfirmed: {
                title: 'Booking is confirmed',
                description:
                    'Thank you for booking this adventure with us! CruiseCode and Alaska X are proud to be part of your travel plans. We hope you have an incredible trip, and we appreciate your business.',
                buttons: {
                    login: 'Login',
                    viewBooking: 'View Booking',
                },
            },
        },
    },
    b2c: {
        payments: {
            editPaymentMethodSuccess: {
                title: 'Payment Method Updated',
                description: '',
                buttons: {
                    close: 'Close',
                },
            },
            addNewPaymentMethodSuccess: {
                title: 'Payment Method Added',
                description: '',
                buttons: {
                    close: 'Close',
                },
            },
            updatePrimaryPaymentMethodSucces: {
                title: 'Primary Payment Method Updated',
                description: '',
                buttons: {
                    close: 'Close',
                },
            },
        },
        manageBooking: {
            modifyBooking: {
                title: 'Booking Updated',
                description: '',
                buttons: {
                    close: 'Close',
                },
            },
            cancelBooking: {
                title: 'Booking Cancelled',
                description: '',
                buttons: {
                    close: 'Close',
                },
            },
        },
    },
    agent: {
        manageBooking: {
            modifyBooking: {
                title: 'Booking Updated',
                description: '',
                buttons: {
                    close: 'Close',
                },
            },
            cancelBooking: {
                title: 'Booking Cancelled',
                description: '',
                buttons: {
                    close: 'Close',
                },
            },
            successEmailSend: {
                title: 'Email sent successfully!',
                description: '',
                buttons: {
                    close: 'Close',
                },
            },
        },
    },
};
