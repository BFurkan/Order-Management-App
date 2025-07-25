# Order Management System - User Manual

## Table of Contents
1. [Getting Started](#getting-started)
2. [System Overview](#system-overview)
3. [Managing Orders](#managing-orders)
4. [Confirming Items](#confirming-items)
5. [Adding Comments](#adding-comments)
6. [Viewing Confirmed Items](#viewing-confirmed-items)
7. [Tips and Best Practices](#tips-and-best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Frequently Asked Questions](#frequently-asked-questions)

---

## Getting Started

### Accessing the System
1. Open your web browser
2. Navigate to the Order Management System URL
3. The system will load showing the main Order Details page

### System Requirements
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **Internet Connection**: Required for real-time updates
- **Screen Resolution**: Minimum 1024x768 recommended

### Navigation
The system has two main pages:
- **Order Details**: Main page for processing orders
- **Confirmed Items**: View all confirmed items

---

## System Overview

### What This System Does
The Order Management System helps you:
- View and process product orders
- Confirm individual items with serial numbers
- Add comments to orders and individual items
- Track which items have been confirmed
- View all confirmed items in one place

### Main Features
- **Individual Item Processing**: Each item in an order can be confirmed separately
- **Serial Number Tracking**: Record serial numbers for each confirmed item
- **Dual Comment System**: Add comments at both order and item levels
- **Real-time Updates**: Changes are saved immediately
- **Flexible Display**: Show/hide columns as needed

---

## Managing Orders

### Understanding the Order Display

#### Order Structure
Orders are displayed in an accordion format:
- **Order Header**: Shows Order ID and summary information
- **Order Content**: Contains individual items when expanded
- **Item Rows**: Each item in the order appears as a separate row

#### Order Information Displayed
- **Product Name**: The name of the product ordered
- **Order Date**: When the order was placed
- **Item #**: Sequential number for each item (Item #1, Item #2, etc.)
- **Ordered By**: Username (email prefix) of the person who ordered
- **Serial Number**: Field for entering the item's serial number
- **Action**: Confirm button for each item
- **Comments**: Order and item-level comments

### Working with Orders

#### Viewing Orders
1. Orders are grouped by Order ID
2. Click the accordion header to expand an order
3. Each item in the order appears as a separate row
4. Items are numbered sequentially (Item #1, Item #2, etc.)

#### Order Status Indicators
- **Order Comment Chip**: Blue chip appears if order has comments
- **Item Comment Chip**: Purple chip appears if any items have comments
- **Confirmed Button**: Green "Confirmed" button for completed items
- **Confirm Button**: Blue "Confirm" button for pending items

#### Customizing the Display
1. Look for the "Column Selector" button (usually top-right)
2. Click to open the column visibility menu
3. Check/uncheck columns you want to show/hide:
   - Product Name
   - Order Date
   - Item Number
   - Ordered By
   - Serial Number
   - Action buttons
   - Order Comments
   - Item Comments

---

## Confirming Items

### Step-by-Step Confirmation Process

#### Before You Start
- Have the physical item and its serial number ready
- Ensure you're confirming the correct item in the correct order

#### Confirming an Item
1. **Locate the Order**: Find the correct order by Order ID
2. **Expand the Order**: Click the order header to see all items
3. **Find the Specific Item**: Look for the correct Item # (Item #1, Item #2, etc.)
4. **Enter Serial Number**:
   - Click in the "Serial Number" field for that specific item
   - Type or scan the serial number
   - The field will show what you've entered
5. **Confirm the Item**:
   - Click the blue "Confirm" button for that item
   - Wait for the success message
   - The button will turn green and say "Confirmed"
   - The serial number field will be disabled

#### Important Notes
- **One Item at a Time**: Each item must be confirmed individually
- **Serial Number Required**: You cannot confirm without entering a serial number
- **Cannot Undo**: Once confirmed, items cannot be easily undone
- **Order Completion**: Orders disappear from this page when all items are confirmed

### Using Barcode Scanners

#### Scanner Setup
- Ensure your scanner is in "Manual Trigger Mode"
- Scanner should be configured to add Enter/Tab after scanning

#### Scanning Process
1. Click in the serial number field
2. Aim scanner at the correct barcode (usually the top barcode)
3. Pull the trigger to scan
4. Verify the correct number was captured
5. Proceed with confirmation

#### Scanner Tips
- **Multiple Barcodes**: If there are multiple barcodes, cover the ones you don't want
- **Scan Carefully**: Make sure you're scanning the serial number, not other codes
- **Manual Entry**: You can always type the number manually if scanning fails

---

## Adding Comments

### Two Types of Comments

#### Order Comments
- Apply to the entire order
- Visible to all items in that order
- Examples: "Urgent delivery", "Handle with care", "Customer special request"

#### Item Comments
- Apply to specific individual items
- Each item can have its own unique comment
- Examples: "Scratched packaging", "Extra testing required", "Different model"

### Adding Order Comments

#### How to Add Order Comments
1. **Locate the Order**: Find the order you want to comment on
2. **Click Comment Button**: In the order header, click "Add Order Comment" or "Edit Order Comment"
3. **Enter Comment**: Type your comment in the dialog box
4. **Save**: Click "Save" to store the comment

#### Order Comment Features
- Comments appear in the order header after saving
- Blue "Has Order Comment" chip appears when comments exist
- Comments are visible on all items in the order
- Can be edited at any time

### Adding Item Comments

#### How to Add Item Comments
1. **Locate the Specific Item**: Find the exact item row (Item #1, Item #2, etc.)
2. **Click Item Comment Button**: Click "Add Comment" or "Edit Comment" in that item's row
3. **Enter Comment**: Type your comment specific to that item
4. **Save**: Click "Save" to store the comment

#### Item Comment Features
- Each item can have its own unique comment
- Comments only appear for that specific item
- Can be edited until the item is confirmed
- Disabled after confirmation (view-only)

### Comment Best Practices
- **Be Specific**: Include relevant details about issues or special requirements
- **Use Clear Language**: Others may need to read your comments
- **Add Early**: Add comments before confirming items when possible
- **Order vs Item**: Use order comments for general notes, item comments for specific issues

---

## Viewing Confirmed Items

### Accessing Confirmed Items
1. Navigate to the "Confirmed Items" page
2. This page shows all items that have been confirmed

### Understanding the Confirmed Items Page

#### Layout
- Orders are grouped by Order ID in accordion format
- Each confirmed item appears as a separate row
- Shows item numbers, serial numbers, and comments

#### Information Displayed
- **Order ID**: Groups items by order
- **Product Name**: What was confirmed
- **Order Date**: When originally ordered
- **Item Number**: Which specific item (Item #1, Item #2, etc.)
- **Ordered By**: Who originally placed the order
- **Serial Number**: The recorded serial number
- **Order Comments**: Comments that apply to the whole order
- **Item Comments**: Comments specific to each item

### Editing Comments on Confirmed Items

#### Editing Order Comments
1. Click "Edit Order Comment" in the order header
2. Modify the comment text
3. Click "Save" to update

#### Editing Item Comments
1. Find the specific confirmed item row
2. Click "Edit Comment" for that item
3. Modify the comment text
4. Click "Save" to update

#### Notes on Editing
- Serial numbers cannot be changed after confirmation
- Items cannot be "unconfirmed" from this page
- Comments can be updated as needed for record-keeping

---

## Tips and Best Practices

### Workflow Tips

#### Efficient Processing
1. **Organize Physically**: Arrange items in the same order as shown on screen
2. **Process Sequentially**: Confirm items in order (Item #1, then #2, then #3)
3. **Double-Check**: Verify serial numbers before confirming
4. **Use Comments**: Add notes about any issues immediately

#### Scanner Best Practices
1. **Clean Scanning**: Ensure barcodes are clean and undamaged
2. **Proper Distance**: Hold scanner at appropriate distance from barcode
3. **Steady Hands**: Keep scanner steady while triggering
4. **Verify Results**: Always check what was scanned before confirming

### Data Entry Tips

#### Serial Numbers
- **Format Consistency**: Enter serial numbers consistently
- **No Extra Spaces**: Avoid leading/trailing spaces
- **Clear Characters**: Distinguish between 0/O, 1/I, etc.
- **Double-Check**: Verify against physical label

#### Comments
- **Meaningful Content**: Write comments that will be useful later
- **Professional Language**: Use appropriate business language
- **Specific Details**: Include relevant part numbers, damage descriptions, etc.
- **Date References**: Include dates for time-sensitive comments

### Quality Control

#### Before Confirming
- [ ] Correct item selected
- [ ] Serial number entered accurately
- [ ] Any necessary comments added
- [ ] Physical item matches system record

#### After Confirming
- [ ] Green "Confirmed" button appears
- [ ] Serial number field is disabled
- [ ] Success message was shown
- [ ] Move to next item

---

## Troubleshooting

### Common Issues and Solutions

#### "Cannot Confirm Item"
**Problem**: Confirm button doesn't work
**Solutions**:
1. Check that serial number is entered
2. Verify you haven't already confirmed this item
3. Refresh the page and try again
4. Contact support if problem persists

#### "Order Not Showing"
**Problem**: Expected order doesn't appear
**Solutions**:
1. Check if all items in the order are already confirmed
2. Verify the order exists in the system
3. Refresh the page
4. Check with administrator

#### "Scanner Not Working"
**Problem**: Barcode scanner not entering data
**Solutions**:
1. Check scanner battery/connection
2. Verify scanner is in correct mode
3. Try manual entry
4. Check if field is selected/active

#### "Comments Not Saving"
**Problem**: Comments disappear after entering
**Solutions**:
1. Ensure you clicked "Save" in the dialog
2. Check your internet connection
3. Try shorter comments
4. Refresh page and try again

#### "Wrong Serial Number Entered"
**Problem**: Entered incorrect serial number
**Solutions**:
1. If not yet confirmed: Clear field and re-enter
2. If already confirmed: Contact administrator for correction
3. Add item comment explaining the situation

### Getting Help

#### Before Contacting Support
1. Try refreshing the page
2. Check your internet connection
3. Verify you're following the correct steps
4. Note any error messages exactly

#### When Contacting Support
Include:
- Your username/email
- Order ID (if applicable)
- Item number (if applicable)
- Exact error message
- Steps you were taking when the problem occurred
- Browser type and version

---

## Frequently Asked Questions

### General Questions

#### Q: How do I know which item is Item #1, Item #2, etc.?
**A**: Items are numbered sequentially starting from 1. The system assigns these numbers, and they represent the order items appear in the system, not necessarily any physical numbering.

#### Q: Can I confirm items out of order?
**A**: Yes, you can confirm Item #3 before Item #1 if needed. The numbering is just for identification.

#### Q: What happens when I confirm all items in an order?
**A**: The entire order disappears from the Order Details page and moves to the Confirmed Items page.

### Confirmation Questions

#### Q: Can I undo a confirmation?
**A**: No, confirmations cannot be undone through the normal interface. Contact your administrator if you need to reverse a confirmation.

#### Q: What if I don't have a serial number?
**A**: You must enter something in the serial number field. If there's no serial number, enter "N/A" or check with your supervisor for guidance.

#### Q: Can multiple people work on the same order?
**A**: Yes, but be careful not to confirm the same item twice. The system prevents double-confirmation, but coordination is important.

### Comment Questions

#### Q: What's the difference between order comments and item comments?
**A**: Order comments apply to the entire order and are visible everywhere that order appears. Item comments are specific to individual items.

#### Q: Can I see comments after confirming items?
**A**: Yes, you can view and edit comments on the Confirmed Items page.

#### Q: Do I need to add comments?
**A**: Comments are optional but recommended for any special situations, damages, or important notes.

### Technical Questions

#### Q: Why did my page refresh/reload?
**A**: This can happen due to network issues or browser problems. Your confirmed items should still be saved.

#### Q: Can I use this on my phone or tablet?
**A**: The system works on mobile devices but is optimized for desktop use. Some features may be harder to use on small screens.

#### Q: What browsers work best?
**A**: Chrome, Firefox, Safari, and Edge all work well. Make sure you're using a recent version.

---

## Quick Reference

### Essential Steps for New Users

#### First Time Setup
1. Open the Order Management System
2. Familiarize yourself with the accordion layout
3. Practice expanding/collapsing orders
4. Test the column selector to customize your view

#### Daily Workflow
1. Locate your assigned orders
2. Expand order to see items
3. For each item:
   - Enter serial number
   - Add any necessary comments
   - Click Confirm
   - Verify green "Confirmed" status
4. Move to next item/order

#### End of Day
1. Check Confirmed Items page to verify your work
2. Review any orders still needing completion
3. Add final comments as needed

### Keyboard Shortcuts
- **Tab**: Move between fields
- **Enter**: Often triggers confirmation (depends on focus)
- **Esc**: Close dialogs
- **F5**: Refresh page

### Support Contacts
- **Technical Issues**: [Your IT Support Contact]
- **Process Questions**: [Your Supervisor Contact]
- **System Administrator**: [Admin Contact]

---

*Last Updated: December 2024*
*Document Version: 1.0*

*For technical details and developer information, see the Technical Manual.* 